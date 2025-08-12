import { 
    polygon as createPolygon, 
    points as createPoints, 
    pointsWithinPolygon, 
    pointToLineDistance,
    pointToPolygonDistance} from "@turf/turf";
import type { Suburb } from "../types/suburbTypes";
import type { TrainLine, TrainLineName } from "../types/trainTypes";
import CBDCenter from "../consts/CBDcenter";

/**
All distances measured from suburb edge, not centroid

_suburbCutoff_: How far before a train line is no longer considered to serve that suburb (in km)

_exclusionCutoff_: How far before a suburb is no longer part of Melbourne (in km)

_innerCityCutoff_: How far before we start requing train lines are only close, and not directly inside
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
        overrides: {[suburb: string]: TrainLineName[]}
    }): Suburb[] {
    
    return suburbs.map((suburb, index) => {
        const override = overrides[suburb.name]
            
        if(override) {
            printDebugDistances(suburb.name, null, 
                override, index, suburbs.length)

            return {
                ...suburb,
                trainLines: override
            }
        }

        const polygon = createPolygon(suburb.coordinates)

        const trainLinesWithDistances = trainLines
            .map((trainLine) => {
                const distance = trainLine.coordinates.reduce((shortestDistance, coordinate) => {
                    const distance = pointToPolygonDistance(coordinate, polygon)
                    
                    return Math.min(shortestDistance, distance)
                }, Infinity)

                return {
                    ...trainLine,
                    distance
                }
            })
            .sort((trainLineA, trainLineB) => trainLineA.distance - trainLineB.distance)

        if(trainLinesWithDistances.every(({distance}) => distance > exclusionCutoff)) {
            return null
        }

        const trainLinesThatServeSuburb = trainLinesWithDistances.filter(({distance}) => {
            const distanceToCBDCenter = pointToPolygonDistance(
                CBDCenter,
                polygon) 

            // if we are a city suburb, like carlton, only count intersections
            if(distanceToCBDCenter < cityCutoff) {
                return distance < 0
            }

            // if we are inner city, like hawthorn, burnley, count ones within 0.2
            if(distanceToCBDCenter < innerCityCutoff) {
                return distance <= 0.75
            }

            return distance < suburbCutoff
        })

        if(trainLinesThatServeSuburb.length === 0) {
            // if there isnt anything nearby, get the closest train line.
            // multiple lines could be equally close so get all of them ie. belgrave / lilydale
            const epsilon = 0.1//km (100metres)

            // smallest distance
            const closestLineDistance = trainLinesWithDistances[0].distance

            trainLinesWithDistances
                .filter(line => line.distance - closestLineDistance <= epsilon)
                .forEach(line => trainLinesThatServeSuburb.push(line))
        }

        printDebugDistances(suburb.name, trainLinesWithDistances, 
            trainLinesThatServeSuburb.map(trainLine => trainLine.name), index, suburbs.length)

        return {
            ...suburb,
            trainLines: trainLinesThatServeSuburb.map(({name}) => name)
        }
    }).filter(suburbOrNull => suburbOrNull !== null)
}

function printDebugDistances(suburb: string, trainLines: (TrainLine & { distance: number})[] | null, trainLinesThatServeSuburb: TrainLineName[], index: number, total: number) {
    const trainLineRecord: Record<TrainLineName, string> = {
        "Alamein": "🔵",
        "Altona Loop": "🟢",
        "Belgrave": "🔵",
        "Craigieburn": "🟡",
        "Cranbourne": "🩵",
        "Frankston": "🟢",
        "Glen Waverley": "🔵",
        "Hurstbridge": "🔴",
        "Lilydale": "🔵",
        "Mernda": "🔴",
        "Pakenham": "🩵",
        "Sandringham": "🩷",
        "Sunbury": "🟡",
        "Upfield": "🟡",
        "Werribee": "🟢",
        "Williamstown": "🟢"
    }
    
    let trainLineText

    if(trainLines) {
        trainLineText = trainLines
            .slice(0,5)
            .map(trainLine => `\t${trainLine.name}: \t${trainLine.distance.toFixed(3)}km ${trainLinesThatServeSuburb.includes(trainLine.name) ? "✅" : ""} \t ${trainLineRecord[trainLine.name]} `)
            .join("\n")
    } else {
        trainLineText = trainLinesThatServeSuburb
            .slice(0,5)
            .map(trainLine => `\t${trainLine}: \t(OVERRIDE) ${trainLinesThatServeSuburb.includes(trainLine) ? "✅" : ""} \t ${trainLineRecord[trainLine]}`)
            .join("\n")
    }
    
    console.log(
        `(${(index+1).toString().padStart(3,"0")}/${total}) ${suburb}\n`,
        trainLineText
    )
}

export default assignTrainLinesToSuburbs