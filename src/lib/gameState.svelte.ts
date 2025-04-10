import { SvelteMap } from "svelte/reactivity"
import type { MetroLines, Suburb } from "./types"
import { createNanoEvents, type Emitter } from "nanoevents"

export type Guess = {
    isCorrect: boolean,
    suburb: Suburb,
    distanceToTarget: number,
    directionToTarget: number,
    cardinalToTarget: "N" | "S" | "E" | "W",
    emojiDirection: string,
    correctTrainLines: {line: MetroLines, color: string}[]
}

interface GameEvents {
    guessAdded: (guess: Guess) => void
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

    emitter: Emitter
    constructor() {
        this.emitter = createNanoEvents()
    }

    on<E extends keyof GameEvents>(event: E, callback: GameEvents[E]) {
        return this.emitter.on(event, callback)
    }

    addGuess(guess: Guess) {
        gameState.guesses.set(guess.suburb.name.toLowerCase(), guess)
        gameState.emitter.emit('guessAdded', guess)
    }

    giveUp() {
        this.addGuess({
            suburb: this.targetSuburb,
            cardinalToTarget: "N",
            emojiDirection: "🙇",
            isCorrect: true,
            distanceToTarget: 0,
            directionToTarget: 0,
            correctTrainLines: []
        })
    }
}

export const gameState = new GameState()