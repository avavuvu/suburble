import type { Guess } from "./types/guess"
import { writable } from "svelte/store"

type StatusDidYouMean = {
    type: "did you mean",
    suburbName: string
}

type StatusNotFound = {
    type: "not found",
    notFoundName: string
}

type StatusInputEmpty = {
    type: "empty"
}

type StatusAlreadyGuessed = {
    type: "already guessed",
    alreadyGuessedName: string
}

type StatusNewGuess = {
    type: "guess",
    guess: Guess,
    bestGuess: Guess
    suburbName: string
}

type StatusStart = {
    type: "start"
}

type StatusItem = {
    shake?: boolean
} & (
        StatusDidYouMean
        | StatusNotFound
        | StatusInputEmpty
        | StatusAlreadyGuessed
        | StatusNewGuess
        | StatusStart
    )

class StatusManager {
    status = writable<StatusItem>({ type: "start" })

    setStatus(statusItem: StatusItem) {
        this.status.set(statusItem)
    }
}

const statusManager = new StatusManager()

export default statusManager
