import { cleanCoords, lineString, point, pointToLineDistance } from "@turf/turf"

export type Coordinates = [number, number]

export type Suburb = {
    name: string,
    coordinates: Coordinates[],
    centroid: Coordinates
}

export type TrainLine = {
    name: string,
    coordinates: Coordinates[],
}




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

    return suburbs.map(({centroid, name, coordinates}) => {
        const centerPoint = point([centroid[1],centroid[0]])
        
        let distances: {distance: number, segmentName: string}[] = []
        
        for(const line of trainLinesGeoJson) {
            const distance = pointToLineDistance(centerPoint, line.lineString, {
                units: "kilometers"
            })

            distances.push({
                distance,
                segmentName: line.name
            })
        }

        distances.sort((a, b) => a.distance - b.distance)

        let closestSegment = ""
        let lines: string[] = []
        let shortestDistance = Infinity
        let iterations = 0
        while(closestSegment === "") {
            let firstSegment = distances[iterations].segmentName
            const mappedSegment = segmentMap.find(({segment}) => segment === firstSegment)

            if( mappedSegment ) {
                closestSegment = mappedSegment.segment
                lines = mappedSegment.lines
                shortestDistance = distances[iterations].distance
                break;
            }

            iterations ++
            if(iterations === 3) {
                break;
            }
        }

        console.log(name, "shortest", shortestDistance, closestSegment)

        if(shortestDistance > 4/*km*/) { 
            console.log(name, "has no train line nearby")
            return { 
                name, 
                lines: [],
                closestSegment: "No Train Nearby",
            }
        }

        return { 
            name, 
            lines,
            centroid,
            coordinates
        }
    })
}

import suburbs from "./json/suburbs.json"
import trainLines from "./json/train_lines.json"
import segmentMap from "./json/segments.json"

const mappedSuburbs = findNearestTrainLine(suburbs as Suburb[], trainLines as TrainLine[], segmentMap)

await Bun.write("./output/mappedSuburbs.json", JSON.stringify(mappedSuburbs))