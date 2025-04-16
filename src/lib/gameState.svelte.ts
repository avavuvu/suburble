import { SvelteMap } from "svelte/reactivity"
import type { MetroLines, PTVLineOverlap, Suburb, TramLines } from "./types"
import { createNanoEvents, type Emitter } from "nanoevents"
import { getLineOverlap } from "./guessManager"
import { generateHelpText, type Help } from "./help"
import distance from "@turf/distance"
import { bearing } from "@turf/turf"

export type Guess = {
    type: "guess",
    isCorrect: boolean,
    suburb: Suburb,
    distanceToTarget: number,
    directionToTarget: number,
    cardinalToTarget: "North" | "South" | "East" | "West",
    emojiDirection: string,
    overlap: PTVLineOverlap,
    guessesLeft: number,
}

export type CorrectSuburb = {
    type: "final",
    didWin: boolean,
    suburb: Suburb,
}

interface GameEvents {
    guessAdded: (guess: Guess) => void,
    gameEnded: (guess: CorrectSuburb) => void
}

const nullSuburb: Suburb = {
    name: "null",
    centroid: [0,0],
    coordinates: [[0,0]],
    lines: []
}

class GameState {
    targetSuburb = $state(nullSuburb)
    guesses!: SvelteMap<string, Guess | CorrectSuburb>
    placeholderSuburb = $state("")
    helpText = $state("Type any Melbourne Suburb")
    guessesLeft = $state(8)
    maxGuesses = 8
    gameState: "playing" | "ended"  = $state("playing")
    bestGuess: Guess | undefined = $state(undefined)
    emitter: Emitter

    constructor() {
        this.emitter = createNanoEvents()
    }

    init(targetSuburb: Suburb) {
        this.targetSuburb = targetSuburb
        this.guesses = new SvelteMap<string, Guess | CorrectSuburb>()
    }

    on<E extends keyof GameEvents>(event: E, callback: GameEvents[E]) {
        return this.emitter.on(event, callback)
    }

    addGuess(guessSuburb: Suburb) {
        this.guessesLeft -= 1

        const isCorrect = guessSuburb.name === this.targetSuburb.name
        
        if(isCorrect) {
            this.endGame(true)
            return
        }

        if(this.guessesLeft === 0) {
            this.endGame(isCorrect)
            return
        }


        const distanceToTarget = distance(
            this.targetSuburb.centroid, 
            guessSuburb.centroid,
            { units: "kilometres"}
        )

        const directionToTarget = bearing(
            guessSuburb.centroid,
            this.targetSuburb.centroid, 
        )

        const cardinalToTarget: "North" | "South" | "East" | "West" = {
            0:      "North",
            "-0":   "North",
            90:     "East",
            180:    "South",
            270:    "West",
            "-90":  "West",

        }[Math.round((directionToTarget + 90) / 90) * 90]! as "North" | "South" | "East" | "West"
        
        let emojiDirection = {
            "North": "☝️",
            "South": "👇",
            "East": "👉",
            "West": "👈",
        }[cardinalToTarget]

        const overlap = getLineOverlap(guessSuburb.lines, this.targetSuburb.lines)

        const newGuess: Guess = {
            type: "guess",
            isCorrect,
            suburb: guessSuburb,
            distanceToTarget,
            directionToTarget,
            cardinalToTarget,
            emojiDirection,
            overlap,
            guessesLeft: this.guessesLeft
        }

        if(this.guesses.size === 2 || (overlap.lines.length < 3 && overlap.type !== "none")) {
            this.setHelpText({
                type: "Line",
                overlap, 
                suburb: guessSuburb
            })
        } else {
            gameState.setHelpText({
                type: "Distance",
                cardinal: cardinalToTarget,
                distanceToTarget,
                suburb: guessSuburb
            })
        }

        if(!this.bestGuess) {
            this.bestGuess = newGuess
        } else {
            if(this.bestGuess.distanceToTarget > newGuess.distanceToTarget) {
                this.bestGuess = newGuess
            }
        }

        this.guesses.set(guessSuburb.name.toLowerCase(), newGuess)
        this.emitter.emit('guessAdded', newGuess)
    }

    endGame(won: boolean) {
        const finalEntry: CorrectSuburb = {
            type: "final",
            didWin: won,
            suburb: this.targetSuburb
        }

        this.guesses.set(this.targetSuburb.name.toLocaleLowerCase(), finalEntry)
        this.gameState = "ended"
        this.emitter.emit('gameEnded', finalEntry)
    }

    giveUp() {
        this.endGame(false)
    }

    setHelpText(help: Help) {
        this.helpText = generateHelpText(help)
    }
}

export const gameState = new GameState()