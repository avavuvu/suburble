import { sineIn } from "svelte/easing"
import type { Suburb, TrainLine } from "./types"
import { trainLineColorMap } from "./consts"

export const getClosenessRating = (distanceToTarget: number, farExtent = 20) => {
    return sineIn(
        Math.max(
            0,
            (1 - (distanceToTarget / farExtent))
        )
    )
}

export const getCorrectTrainLines = (guessSuburb: Suburb, targetSuburb: Suburb) => {
    return guessSuburb.lines.filter((line) => {
        if(line === "Williamstown") {
            line = "Frankston"
        }

        return targetSuburb.lines.includes(line)
    }).map(line => {
        return {
            line,
            color: trainLineColorMap[line],
        }
    })
} 