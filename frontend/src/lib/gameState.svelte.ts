import { SvelteMap } from "svelte/reactivity"
import type { Cardinal, MetroLines, PTVLineOverlap, Suburb } from "./types"
import { createNanoEvents, type Emitter } from "nanoevents"
import { getLineOverlap } from "./guessManager"
import { generateHelpText, type Help } from "./help"
import distance from "@turf/distance"
import { bearing } from "@turf/turf"
import { streakManager } from "./streakManager"

export type Guess = {
    type: "guess",
    isCorrect: boolean,
    suburb: Suburb,
    distanceToTarget: number,
    directionToTarget: number,
    cardinalToTarget: Cardinal,
    emoji: string,
    overlap: PTVLineOverlap,
    guessesLeft: number,
}

export type CorrectSuburb = {
    type: "final",
    didWin: boolean,
    suburb: Suburb,
    guessesLeft: number,
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
    lastGuess: Guess | undefined = $state(undefined)
    emitter: Emitter
    dateKey!: string

    constructor() {
        this.emitter = createNanoEvents()
    }

    init(targetSuburb: Suburb, dateKey: string) {
        this.targetSuburb = targetSuburb
        this.dateKey = dateKey
        this.guesses = new SvelteMap<string, Guess | CorrectSuburb>()
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

        const bearingToTarget = bearing(
            guessSuburb.centroid,
            this.targetSuburb.centroid, 
        )

        const directionToTarget = Math.round((bearingToTarget + 90) / 45) * 45

        const cardinalToTarget: Cardinal = {
            0:      "North",
            "-0":   "North",
            45:     "North-East",
            90:     "East",
            135:    "South-East",
            180:    "South",
            225:    "South-West",
            270:    "West",
            315:    "North-West",
            "-45":  "North-West",
            "-90":  "West",
        }[directionToTarget]! as Cardinal

        let emojiDirection = {
            "North": {
                emoji: "☝️",
                offset: 0,
            },
            "South-West": {
                emoji: "👇",
                offset: 180,
            },
            "South-East": {
                emoji: "👇",
                offset: 180,
            },
            "South": {
                emoji: "👇",
                offset: 180,
            },
            "North-East": {
                emoji: "👉",
                offset: -90,
            },
            "East": {
                emoji: "👉",
                offset: -90,
            },
            "West": {
                emoji: "👈",
                offset: 90,
            },
            "North-West": {
                emoji: "👈",
                offset: 90,
            },
        }[cardinalToTarget]

        const overlap = getLineOverlap(guessSuburb.lines, this.targetSuburb.lines)

        const newGuess: Guess = {
            type: "guess",
            isCorrect,
            suburb: guessSuburb,
            distanceToTarget,
            directionToTarget: directionToTarget + emojiDirection.offset,
            cardinalToTarget,
            emoji: emojiDirection.emoji,
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
            if(this.lastGuess) {
                gameState.setHelpText({
                    type: "WarmCool",
                    lastGuessDistance: this.lastGuess.distanceToTarget,
                    thisGuessDistance: distanceToTarget,
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
        }

        if(!this.bestGuess) {
            this.bestGuess = newGuess
        } else {
            if(this.bestGuess.distanceToTarget > newGuess.distanceToTarget) {
                this.bestGuess = newGuess
            }
        }

        this.guesses.set(guessSuburb.name.toLowerCase(), newGuess)

        if(isCorrect) {
            this.endGame(true)
            return
        }

        if(this.guessesLeft === 0) {
            this.endGame(isCorrect)
            return
        }

        this.lastGuess = newGuess
        this.emitter.emit('guessAdded', newGuess)
    }

    endGame(won: boolean) {
        const finalEntry: CorrectSuburb = {
            type: "final",
            didWin: won,
            suburb: this.targetSuburb,
            guessesLeft: gameState.guessesLeft
        }

        streakManager.addGame(finalEntry)

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