import {
    polygon as createPolygon,
    pointToPolygonDistance
} from "@turf/turf";
import type { Suburb } from "../types/suburbTypes";
import type { TrainLine, TrainLineName } from "../types/trainTypes";
import CBDCenter from "../consts/CBDcenter";

// Precomputed train line data, calculated once before the suburb loop
type TrainLineWithMeta = TrainLine & {
    bbox: { minLng: number; maxLng: number; minLat: number; maxLat: number }
}

function getBBox(coordinates: [number, number][]) {
    let minLng = Infinity, maxLng = -Infinity
    let minLat = Infinity, maxLat = -Infinity

    for (const [lng, lat] of coordinates) {
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
    }

    return { minLng, maxLng, minLat, maxLat }
}

/**
 * Rough great-circle degrees → km conversion.
 * 1 degree latitude ≈ 111km; longitude shrinks with cos(lat).
 * Used only for the bbox pre-filter, so precision isn't critical.
 */
function bboxDistanceKm(
    suburbBBox: ReturnType<typeof getBBox>,
    lineBBox: ReturnType<typeof getBBox>
): number {
    // Find the closest point in lineBBox to suburbBBox in each axis
    const dLng = Math.max(0,
        Math.max(suburbBBox.minLng - lineBBox.maxLng, lineBBox.minLng - suburbBBox.maxLng)
    )
    const dLat = Math.max(0,
        Math.max(suburbBBox.minLat - lineBBox.maxLat, lineBBox.minLat - suburbBBox.maxLat)
    )

    const midLat = (suburbBBox.minLat + suburbBBox.maxLat) / 2
    const kmPerLng = 111 * Math.cos(midLat * Math.PI / 180)
    const kmPerLat = 111

    return Math.sqrt((dLng * kmPerLng) ** 2 + (dLat * kmPerLat) ** 2)
}

/**
All distances measured from suburb edge, not centroid

_suburbCutoff_: How far before a train line is no longer considered to serve that suburb (in km)

_exclusionCutoff_: How far before a suburb is no longer part of Melbourne (in km)

_innerCityCutoff_: How far before we start requiring train lines are only close, and not directly inside

_cityCutoff_: How far before we only count intersections
**/
function assignTrainLinesToSuburbs(
    suburbs: Suburb[],
    trainLines: TrainLine[],
    {
        suburbCutoff, exclusionCutoff, innerCityCutoff, cityCutoff, overrides
    }: {
        suburbCutoff: number
        exclusionCutoff: number
        innerCityCutoff: number,
        cityCutoff: number,
        overrides: { [suburb: string]: TrainLineName[] }
    }): Suburb[] {

    const trainLinesWithMeta: TrainLineWithMeta[] = trainLines.map(line => ({
        ...line,
        bbox: getBBox(line.coordinates as [number, number][])
    }))

    return suburbs.map((suburb, index) => {
        const override = overrides[suburb.name]

        if (override) {
            printDebugDistances(suburb.name, null,
                override, index, suburbs.length)

            return {
                ...suburb,
                trainLines: override
            }
        }

        const polygon = createPolygon(suburb.coordinates)
        const suburbBBox = getBBox(
            suburb.coordinates[0] as [number, number][]
        )

        const distanceToCBDCenter = pointToPolygonDistance(CBDCenter, polygon)

        const trainLinesWithDistances = trainLinesWithMeta
            .map((trainLine) => {
                // --- Bbox pre-filter: skip expensive polygon math if clearly too far ---
                const bboxDist = bboxDistanceKm(suburbBBox, trainLine.bbox)
                if (bboxDist > 1) { // MAGIC NUMBER BEWARE
                    return { ...trainLine, distance: bboxDist }
                }

                const distance = trainLine.coordinates.reduce((shortestDistance, coordinate) => {
                    // --- Early exit: already inside polygon, can't get closer ---
                    if (shortestDistance < 0) return shortestDistance

                    const distance = pointToPolygonDistance(coordinate, polygon)
                    return Math.min(shortestDistance, distance)
                }, Infinity)

                return {
                    ...trainLine,
                    distance
                }
            })
            .sort((a, b) => a.distance - b.distance)

        if (trainLinesWithDistances.every(({ distance }) => distance > exclusionCutoff)) {
            return null
        }

        const trainLinesThatServeSuburb = trainLinesWithDistances.filter(({ distance }) => {
            // if we are a city suburb, like carlton, only count intersections
            if (distanceToCBDCenter < cityCutoff) {
                return distance < 0
            }

            // if we are inner city, like hawthorn, burnley, count ones within 0.75km
            if (distanceToCBDCenter < innerCityCutoff) {
                return distance <= 0.75
            }

            return distance < suburbCutoff
        })

        if (trainLinesThatServeSuburb.length === 0) {
            const epsilon = 0.1 // km (100 metres)
            const closestLineDistance = trainLinesWithDistances[0].distance

            trainLinesWithDistances
                .filter(line => line.distance - closestLineDistance <= epsilon)
                .forEach(line => trainLinesThatServeSuburb.push(line))
        }

        printDebugDistances(suburb.name, trainLinesWithDistances,
            trainLinesThatServeSuburb.map(trainLine => trainLine.name), index, suburbs.length)

        return {
            ...suburb,
            trainLines: trainLinesThatServeSuburb.map(({ name }) => name)
        }
    }).filter(suburbOrNull => suburbOrNull !== null)
}

function printDebugDistances(suburb: string, trainLines: (TrainLine & { distance: number })[] | null, trainLinesThatServeSuburb: TrainLineName[], index: number, total: number) {
    const trainLineRecord: Record<TrainLineName, string> = {
        "Alamein": "🔵",
        "Altona Loop": "🩷",
        "Belgrave": "🔵",
        "Craigieburn": "🟡",
        "Cranbourne": "🩵",
        "Frankston": "🟢",
        "Glen Waverley": "🔵",
        "Hurstbridge": "🔴",
        "Lilydale": "🔵",
        "Mernda": "🔴",
        "East Pakenham": "🩵",
        "Sandringham": "🩷",
        "Sunbury": "🩵",
        "Upfield": "🟡",
        "Werribee": "🩷",
        "Williamstown": "🩷",
        "Geelong": "💜",
        "Ballarat": "💜",
    }

    let trainLineText

    if (trainLines) {
        trainLineText = trainLines
            .slice(0, 5)
            .map(trainLine => `\t${trainLine.name}: \t${trainLine.distance.toFixed(3)}km ${trainLinesThatServeSuburb.includes(trainLine.name) ? "✅" : ""} \t ${trainLineRecord[trainLine.name]} `)
            .join("\n")
    } else {
        trainLineText = trainLinesThatServeSuburb
            .slice(0, 5)
            .map(trainLine => `\t${trainLine}: \t(OVERRIDE) ${trainLinesThatServeSuburb.includes(trainLine) ? "✅" : ""} \t ${trainLineRecord[trainLine]}`)
            .join("\n")
    }

    console.log(
        `(${(index + 1).toString().padStart(3, "0")}/${total}) ${suburb}\n`,
        trainLineText
    )
}

export default assignTrainLinesToSuburbs