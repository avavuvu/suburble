import type { DirectionInfo } from "../utils/getDirectionInformation"
import type { FactSheet } from "./faceSheet"
import type { Suburb } from "./suburb"

export type CorrectGuess = {
    type: "correct",
    suburb: Suburb
    directionInfo: DirectionInfo
}

export type IncorrectGuess = {
    type: "incorrect",
    directionInfo: DirectionInfo,
    suburb: Suburb
}

export type Guess = IncorrectGuess | CorrectGuess

export type RevealData = {

    didWin: boolean

    bestGuess?: IncorrectGuess
    guesses: number

    histogramPromise?: Promise<{
        histogram: {
            [k: string]: number;
        },
        averageGuess: {
            count: string
        }
    }>
}
