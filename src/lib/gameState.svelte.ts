import { SvelteMap } from "svelte/reactivity"
import type { Suburb } from "./types"
import { createNanoEvents, type Emitter } from "nanoevents"

export type Guess = {
    suburb: Suburb,
    distanceToTarget: number
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

    emitter: Emitter
    constructor() {
        this.emitter = createNanoEvents()
    }

    on<E extends keyof GameEvents>(event: E, callback: GameEvents[E]) {
        return this.emitter.on(event, callback)
    }
}

export const gameState = new GameState()