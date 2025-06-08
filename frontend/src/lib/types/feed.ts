import type { DirectionInfo } from "$lib/utils/getDirectionInformation"
import type { FactSheet } from "./faceSheet"
import type { CorrectGuess, IncorrectGuess, RevealData } from "./guess"
import type { Suburb } from "./suburb"
import type { TrainLineName } from "./trainLine"

export type GoodnessColor = "green" | "yellow" | "gray"


export type Overlap = {
    type: "phrase", 
    phrase: string,
    color: GoodnessColor
    trainLines:  Map<TrainLineName, GoodnessColor>
} | {
    type: "array", 
    trainLines: Map<TrainLineName, GoodnessColor>
} 

export type FeedGuess = {
    type: "guess"
    guess: IncorrectGuess
    guessComponentsGoodness: Record<keyof DirectionInfo, GoodnessColor>
    overlap: Overlap
}

export type FeedClue = {
    type: "clue"
    clue: string
}


export type FeedReveal = {
    type: "reveal",
    factSheet: FactSheet
    suburb: Suburb,
    revealData: RevealData
}


export type FeedItem = {key: number} & (FeedClue | FeedGuess | FeedReveal)