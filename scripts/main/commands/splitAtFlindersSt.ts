import type { Feature, LineString } from "geojson"
import {
    lineString as createLineString,
    center as findCenter,
    bearing as findBearing,
    lineSplit
} from "@turf/turf"
import flindersStSplitter from "../consts/flindersStSplit"
import type { TrainLine, TrainLineName } from "suburble-shared"


function splitAtFlindersSt(trainLines: TrainLine[], override: {
    // if its equal null, use the existing name, 
    // otherwise use an override and only keep one line
    direction: "east" | "west",
    name: TrainLineName
}): TrainLine[] {
    const flindersStCenter = findCenter(flindersStSplitter)

    // for the case of frankston:
    // werribee, altona loop, and williamstown all become frankston
    // so we only need to keep one copy of frankston
    let hasOverridden = false

    return trainLines.flatMap((trainLine) => {
        const lineString = createLineString(trainLine.coordinates)

        const splitLines = lineSplit(
            lineString as Feature<LineString>,
            flindersStSplitter
        )

        return splitLines.features
            .map(lineString => {
                const center = findCenter(lineString)

                const angle = findBearing(center, flindersStCenter)

                let newTrainLineName: TrainLineName;

                if ((angle <= 0 && override.direction === "east")
                    || (angle >= 0 && override.direction === "west")) {
                    newTrainLineName = override.name

                    if (hasOverridden) {
                        return null
                    }

                    hasOverridden = true
                } else {
                    // the name it was pre-split
                    newTrainLineName = trainLine.name
                }

                return {
                    coordinates: lineString.geometry.coordinates,
                    name: newTrainLineName,
                    color: trainLine.color
                }
            })
            .filter(trainLineOrNull => trainLineOrNull !== null)
    })
}

export default splitAtFlindersSt