import type { Guess } from "@t/guess"
import type { Suburb } from "@t/suburb"
import { get, writable } from "svelte/store"

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
    status = writable<StatusItem>({type: "start"})

    setStatus(statusItem: StatusItem) {
        this.status.set(statusItem)

        // return
        // switch(statusItem.type) {
        //     case "did you mean":
                

        //         break
        //     case 'not found':


        //         break;
        // }
    }
}

const statusManager = new StatusManager()

export default statusManager