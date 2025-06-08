export type TrainLine = {
    name: string,
    coordinates: Coordinates[],
}
export type Coordinates = [number, number]

const mergeSegmentsIntoLines = (
    trainLines: TrainLine[],
    segmentMap: {
        segment: string,
        lines: string[]
}[]) => {
    const lineMap: { [segment: string]: string[] } = {}

    segmentMap.forEach(({segment, lines}) => {
        lines.forEach((line) => {
            lineMap[line] = (lineMap[line] || []).concat(segment)
        })
    })

    const metroLines = Object.entries(lineMap).map(([metroLine, segmentNames]) => {
        const coordinates = segmentNames
            .map((segment) => {
                const coordinates = trainLines.find(({name}) => name === segment )?.coordinates

                if(!coordinates) {
                    throw new Error("Unable to match segment to coordinates!")
                }

                return coordinates!
            })
            .flat()

        return {
            name: metroLine,
            coordinates
        }

    })

    return metroLines
}

import trainLines from "./json/train_lines.json"
import segmentMap from "./json/segments.json"

const mergedTrains = mergeSegmentsIntoLines(trainLines as TrainLine[], segmentMap)

await Bun.write("./output/mergedTrainLines.json", JSON.stringify(mergedTrains))