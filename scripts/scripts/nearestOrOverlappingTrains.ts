import { geometry, lineString, multiLineString, point, points, pointsWithinPolygon, pointToLineDistance, simplify, type Coord } from "@turf/turf";
import type { Suburb } from "./nearestTrainLine";


export type TrainLine = LineStringTrainLine | MultiLineTrainLine

type LineStringTrainLine = {
    name: string,
    coordinates: GeoJSON.Position[],
    type: "LineString"
}

type MultiLineTrainLine = {
    name: string,
    coordinates: GeoJSON.Position[][],
    type: "MultiLineString"
}

type TrainLineWithDistance = TrainLine & {distance: number}

const findNearestOrOverlappingTrain = (
    suburbs: Suburb[],
    trainLines: TrainLine[],
    distanceCutOffKm: number = 5
): Map<string, TrainLineWithDistance[]>  => {
    return new Map(suburbs.map(({centroid, name, coordinates}) => {
        const centerPoint = point([centroid[1],centroid[0]])

        const linesWithinSuburbBounds = trainLines.filter(line => {
            const pointsToSearch = points( line.type === "LineString"
                ? line.coordinates
                : line.coordinates.flat())

            const polygon = geometry("Polygon", coordinates)

            // @ts-ignore
            const foundPoints = pointsWithinPolygon(pointsToSearch, polygon)

            if(foundPoints.features.length > 0) {
                return true
            }
        }).map((line) => ({
            ...line,
            distance: 0
        }))

        const linesWithDistances: TrainLineWithDistance[] = trainLines.map((line) => {
            const distance = line.type === "LineString"
                ? pointToLineDistance(centerPoint, lineString(line.coordinates))
                : pointToMultilineDistance(centerPoint, line.coordinates)

            return {
                distance,
                ...line
            }
        }).sort((lineA, lineB) => 
            lineA.distance - lineB.distance
        )

        let lines: TrainLineWithDistance[] = linesWithinSuburbBounds

        const linesWithinOneKm = linesWithDistances.filter(line => line.distance < 1)

        if(linesWithinOneKm.length === 0) {
            const closestLine = linesWithDistances[0]

            if(closestLine.distance < distanceCutOffKm) {
                // if there isnt anything nearby, get the closest train line.
                // multiple lines could be equally close so get all of them ie. belgrave / lilydale

                const epsilon = 0.1//km (100metres)

                // smallest distance
                const closestLineDistance = Math.min(...linesWithDistances.map(line => line.distance));

                linesWithDistances
                    .filter(line => line.distance - closestLineDistance <= epsilon)
                    .forEach(line => lines.push(line))
            }
        }

        lines = lines.concat(linesWithinOneKm)

        return [name, lines]
    }))
}

const pointToMultilineDistance = (point: Coord, coordinates: GeoJSON.Position[][]) => {
    let shortestDistance = Infinity
    for(const line of coordinates) {
        const distance = pointToLineDistance(point, lineString(line), {
            units: "kilometers"
        })

        if(distance < shortestDistance) {
            shortestDistance = distance
        }
    }

    return shortestDistance
}

import suburbs from "./json/suburbs.json"
import trainLines from "./json/trainLineGeoJson.json"
import tramLines from "./json/tramLineGeoJson.json"

const suburbsWithTrainLines = findNearestOrOverlappingTrain(suburbs as Suburb[], trainLines as TrainLine[])
const suburbsWithTramLines = findNearestOrOverlappingTrain(suburbs as Suburb[], tramLines as TrainLine[], 1.75)

// mappedSuburbs.filter(([suburb, lines]) => lines.some(line => line.distance > 1.5)).forEach(([suburb, lines]) => {
//     console.log(`${suburb} \t ${lines.map(line => `${line.name} ${line.distance.toFixed(2)}km`).join(", ")}`)
// })

const mappedSuburbs = (suburbs as Suburb[]).map(suburb => {
    let suburbWithTramsAndTrains: Suburb & {
        lines: string[]
    } = {...suburb, lines: []} 

    ;[suburbsWithTrainLines, suburbsWithTramLines].forEach((suburbMap) => {
        const relevantLines = suburbMap.get(suburb.name)
        if(!relevantLines) {
            console.error("Unable to find line,", suburb.name)
        }

        const lineSet = new Set<string>(relevantLines!.map(({name}) => name))
        const lines = [...lineSet]

        suburbWithTramsAndTrains.lines = suburbWithTramsAndTrains.lines.concat(lines)
    })

    const polygon = simplify(geometry("Polygon", suburb.coordinates), {
        tolerance: 0.0001
    })

    return {
        ...suburbWithTramsAndTrains,
        coordinates: polygon.coordinates
    }
})

await Bun.write("./output/mappedSuburbs.json", JSON.stringify(mappedSuburbs))
