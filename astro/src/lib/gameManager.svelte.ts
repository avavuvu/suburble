import type { Guess, IncorrectGuess, RevealData } from "./types/guess"
import type { Suburb } from "./types/suburb"
import getDirectionInformation from "./utils/getDirectionInformation"
import { SuburbCache, suburbCache } from "./suburbCache"
import feedManager from "./feedManager.svelte.ts"
import { SvelteMap } from "svelte/reactivity"
import suburbNameSearcher from "./queryUtils/fastFuzzy"
import statusManager from "./statusManager.svelte.ts"
import { ClueManager } from "./clueManager.svelte.ts"
import MapManager from "./mapManager.svelte.ts"
import type { FactSheet } from "./types/faceSheet"
import confetti from "canvas-confetti"
import { streakManager } from "./streakManager"

export type GameInstance = {
    targetSuburb: Suburb,
    dateKey: string
}

class GameManager {
    gameInstance!: GameInstance
    guesses: SvelteMap<string, IncorrectGuess> = new SvelteMap([])
    clueManager!: ClueManager
    mapManager!: MapManager
    maxGuesses: number = 5
    factSheet!: FactSheet
    hasImage: boolean = false
    expanded: boolean = $state(false)
    gameEnded: boolean = $state(false)

    get bestGuess() {
        return Array.from(this.guesses.values()).reduce<IncorrectGuess | undefined>((bestGuess, currentGuess) => {
            if (bestGuess === undefined) return currentGuess

            return currentGuess.directionInfo.distanceToTarget < bestGuess.directionInfo.distanceToTarget
                ? currentGuess
                : bestGuess;
        }, undefined)
    }

    async init(targetSuburb: Suburb, dateKey: string) {
        this.gameInstance = {
            targetSuburb,
            dateKey
        }

        const response = await fetch(`/api/factsheet/${SuburbCache.normalizeSuburbName(targetSuburb.name)}.json`)
        this.factSheet = await response.json()

        this.hasImage = this.factSheet.hasImage || false

        this.clueManager = new ClueManager(targetSuburb)
        this.mapManager = new MapManager(targetSuburb.trainLines)

    }

    addGuess(suburb: Suburb) {
        const isCorrect = suburb.name === this.gameInstance.targetSuburb.name

        if (isCorrect) {
            this.endGame(true)
            return
        }

        const directionInfo = getDirectionInformation(suburb.centroid, this.gameInstance.targetSuburb.centroid)
        const newGuess: Guess = { type: "incorrect", directionInfo, suburb }

        feedManager.addIncorrectGuess(newGuess)

        const clueTriggers = [1, 3, 5, 6]
        if (clueTriggers.includes(this.guesses.size)) {
            const clue = this.clueManager.getPriorityClue() ?? this.clueManager.getAnyClue()
            if (clue) this.clueManager.loadClue(clue.clue)
        }

        if (this.guesses.size === this.maxGuesses) {
            this.endGame(false)
            return
        }

        statusManager.setStatus({
            type: "guess",
            bestGuess: this.bestGuess || newGuess,
            guess: newGuess,
            suburbName: suburb.name,
            shake: false
        })

        this.guesses.set(SuburbCache.normalizeSuburbName(suburb.name), newGuess)
        this.mapManager.addGuess(newGuess)
    }

    async attemptGuess(suburbName: string): Promise<boolean> {
        const normalizedName = SuburbCache.normalizeSuburbName(suburbName)

        if (this.guesses.has(normalizedName)) {
            statusManager.setStatus({ type: "already guessed", alreadyGuessedName: suburbName, shake: true })
            return false
        }

        const guessSuburb = await suburbCache.get(normalizedName)

        if (guessSuburb) {
            this.addGuess(guessSuburb)
            return true
        }

        const correctionAttempt = suburbNameSearcher.search(suburbName, { threshold: .7 })

        if (correctionAttempt.length === 0) {
            statusManager.setStatus({ type: "not found", notFoundName: suburbName, shake: true })
            return false
        }

        const correction = correctionAttempt.find(corrected =>
            !this.guesses.has(SuburbCache.normalizeSuburbName(corrected))
        )

        if (!correction) {
            statusManager.setStatus({ type: "already guessed", alreadyGuessedName: correctionAttempt[0], shake: true })
            return false
        }

        statusManager.setStatus({ type: "did you mean", suburbName: correction, shake: true })
        return false
    }

    endGame(didWin: boolean) {
        this.expanded = true
        this.gameEnded = true

        if (didWin) {
            confetti({
                scalar: 1.5
            })
        }

        this.mapManager.addGuess({
            type: "correct",
            suburb: this.gameInstance.targetSuburb,
            directionInfo: {
                cardinalToTarget: "North",
                directionToTarget: 0,
                distanceToTarget: 0,
                emojiDirection: {
                    emoji: "⭐️",
                    offset: 0
                }
            }
        })

        const revealData: RevealData = {
            didWin,
            bestGuess: this.bestGuess,
            guesses: this.guesses.size
        }

        feedManager.addReveal(
            this.factSheet,
            this.gameInstance.targetSuburb,
            revealData
        )

        streakManager.addGame(
            this.gameInstance,
            revealData
        )

    }
}

const gameManager = new GameManager()

export default gameManager
