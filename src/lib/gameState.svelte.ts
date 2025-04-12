import { SvelteMap } from "svelte/reactivity"
import type { MetroLines, PTVLineOverlap, Suburb, TramLines } from "./types"
import { createNanoEvents, type Emitter } from "nanoevents"
import { getLineOverlap } from "./guessManager"
import { generateHelpText, type Help } from "./help"
import distance from "@turf/distance"
import { bearing } from "@turf/turf"

export type Guess = {
    isCorrect: boolean,
    suburb: Suburb,
    distanceToTarget: number,
    directionToTarget: number,
    cardinalToTarget: "North" | "South" | "East" | "West",
    emojiDirection: string,
    overlap: PTVLineOverlap,
    guessesLeft: number,

}

interface GameEvents {
    guessAdded: (guess: Guess) => void,
    gameEnded: (guess: Guess | null) => void
}

const nullSuburb: Suburb = {
    name: "null",
    centroid: [0,0],
    coordinates: [[0,0]],
    lines: []
}

class GameState {
    targetSuburb = $state(nullSuburb)
    guesses = new SvelteMap<string, Guess>()
    placeholderSuburb = $state("")
    helpText = $state("Type any Melbourne Suburb")
    guessesLeft = $state(8)
    gameState: "playing" | "ended"  = $state("playing")

    emitter: Emitter
    constructor() {
        this.emitter = createNanoEvents()
    }

    on<E extends keyof GameEvents>(event: E, callback: GameEvents[E]) {
        return this.emitter.on(event, callback)
    }

    addGuess(guessSuburb: Suburb) {
        this.guessesLeft -= 1

        const isCorrect = guessSuburb.name === this.targetSuburb.name

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

        if(isCorrect) {
            emojiDirection = "👍"
        }

        const overlap = getLineOverlap(guessSuburb.lines, this.targetSuburb.lines)

        const newGuess: Guess = {
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

        this.guesses.set(guessSuburb.name.toLowerCase(), newGuess)
        this.emitter.emit('guessAdded', newGuess)

        if(this.guessesLeft === 0) {
            this.endGame(isCorrect)
        }
    }

    endGame(won: boolean) {
        if(!won) {
            const guess: Guess = {
                isCorrect: true,
                suburb: this.targetSuburb,
                distanceToTarget: 0,
                directionToTarget: 0,
                cardinalToTarget: "North",
                emojiDirection: "💔",
                overlap: getLineOverlap(this.targetSuburb.lines, this.targetSuburb.lines),
                guessesLeft: 0
            }

            this.guesses.set(this.targetSuburb.name.toLocaleLowerCase(), guess)
            this.gameState = "ended"
            this.emitter.emit('gameEnded', guess)
            return
        }

        this.gameState = "ended"
        this.emitter.emit('gameEnded')
    }

    giveUp() {
        this.endGame(false)
    }

    setHelpText(help: Help) {
        this.helpText = generateHelpText(help)
    }
}

export const gameState = new GameState()