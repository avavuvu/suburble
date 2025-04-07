import { cleanCoords, isNumber, lineString, point } from "@turf/turf"
import type { Suburb, TrainLine } from "../src/lib/types"
import pointToLineDistance from "@turf/point-to-line-distance"

const findNearestTrainLine = (
    suburbs: Suburb[], 
    trainLines: TrainLine[], 
    segmentMap: {
        segment: string,
        lines: string[]
}[]) => {
    const trainLinesGeoJson = trainLines.map(({coordinates, name}) => ({
        lineString: cleanCoords(lineString(coordinates)),
        name
    }))

    return suburbs.map(({centroid, name}) => {
        const centerPoint = point([centroid[1],centroid[0]])
        
        let smallestDistance = Infinity
        let closestSegment = ""
        for(const line of trainLinesGeoJson) {
            const distance = pointToLineDistance(centerPoint, line.lineString)

            if(distance < smallestDistance) {
                smallestDistance = distance
                closestSegment = line.name
            }
        }

        return { name, closestSegment }
    })
    .map(({name, closestSegment}) => {
        const segment = segmentMap.find(({segment}) => segment === closestSegment)

        if( !segment ) {
            console.log("No trainline found for", closestSegment)
            return {
                name, lines: []
            }
        }

        return {
            name,
            lines: segment.lines
        }
    })
}

import suburbs from "./json/suburbs.json"
import trainLines from "./json/train_lines.json"
import segmentMap from "./json/segments.json"

const mappedSuburbs = findNearestTrainLine(suburbs as Suburb[], trainLines as TrainLine[], segmentMap)

const jsonDataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mappedSuburbs));
window.open(jsonDataUri, '_blank');