import { sineIn } from "svelte/easing"
import type { Suburb, PTVLine, MetroLines, Cardinal, PTVLineName, PTVLineOverlap } from "./types"
import { trainLineColorMap } from "./consts"

export const getClosenessRating = (distanceToTarget: number, farExtent = 20) => {
    return sineIn(
        Math.max(
            0,
            (1 - (distanceToTarget / farExtent))
        )
    )
}

export const getLineOverlap = (guessSuburbLines: (MetroLines)[], targetSuburbLines: (MetroLines)[]): PTVLineOverlap => {
    const linesA = guessSuburbLines.map(line => line === "Williamstown" ? "Frankston" : line)
    const linesB = targetSuburbLines.map(line => line === "Williamstown" ? "Frankston" : line)

    const doSuburbLinesCompletelyOverlap = linesA.length === linesB.length 
        && linesA.every(value => linesB.includes(value))
    
    if(doSuburbLinesCompletelyOverlap) {
        return {
            type: "every",
            lines: linesA
        }
    }

    const doSuburbsOverlap = linesA.some(line => linesB.includes(line))

    if(doSuburbsOverlap) {
        return {
            type: "some",
            lines: linesA //return the guess suburbs to not give away so much information
        }
    }

    return {
        type: "none",
        lines: []
    }
}

export const getLineColor = (line: (MetroLines)) => {
    const color = trainLineColorMap[line as MetroLines]

    return color
}
