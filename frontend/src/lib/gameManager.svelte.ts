import type { Guess, IncorrectGuess, RevealData } from "@t/guess"
import type { Suburb } from "@t/suburb"
import getDirectionInformation from "./utils/getDirectionInformation"
import { SuburbCache, suburbCache } from "./suburbCache"
import feedManager from "./feedManager.svelte"
import { SvelteMap } from "svelte/reactivity"
import suburbNameSearcher from "./queryUtils/fastFuzzy"
import statusManager from "./statusManager.svelte"
import { ClueManager } from "./clueManager.svelte"
import MapManager from "./mapManager.svelte"
import type { FactSheet } from "@t/faceSheet"
import confetti from "canvas-confetti"
import { streakManager } from "./streakManager"
import mixpanel from "mixpanel-browser"

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
            if(bestGuess === undefined) return currentGuess

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

        mixpanel.track("Game Start")
    }

    addGuess(suburb: Suburb) {
        const isCorrect = suburb.name === this.gameInstance.targetSuburb.name

        const directionInfo = getDirectionInformation(
            suburb.centroid, 
            this.gameInstance.targetSuburb.centroid
        )

        let newGuess: Guess | undefined

        if(!isCorrect) {
            newGuess = {
                type: "incorrect",
                directionInfo,
                suburb
            }

            feedManager.addIncorrectGuess(newGuess)

            if(this.guesses.size === 1 || this.guesses.size === 3 || this.guesses.size === 5  || this.guesses.size === 6) {
                let clue = this.clueManager.getPriorityClue()
                if(!clue) {
                    clue = this.clueManager.getAnyClue()
                }

                if(clue) {
                    this.clueManager.loadClue(clue.clue)
                } else {
                    
                    //TODO: we've run out of clues, what to do?
                }
            }

            if(this.guesses.size === this.maxGuesses) {
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


        } else {
            //WIN

            this.endGame(true)
            return

        }

        this.mapManager.addGuess(newGuess)

        
    }

    async attemptGuess(suburbName: string): Promise<boolean> {
        const guessSuburb = await suburbCache.get(suburbName)
        if(!guessSuburb) {
            const correctionAttempt = suburbNameSearcher.search(suburbName, {
                threshold: .7
            })

            if(correctionAttempt.length > 0) {
                let correction = correctionAttempt.find(corrected => !gameManager.guesses.has(
                    SuburbCache.normalizeSuburbName(corrected)
                ))

                if(!correction) {
                    statusManager.setStatus({
                        type: "already guessed",
                        alreadyGuessedName: correctionAttempt[0],
                        shake: true
                    })
                    return false
                }

                statusManager.setStatus({
                    type: "did you mean",
                    suburbName: correction,
                    shake: true
                })
                
                return false
            }

            statusManager.setStatus({
                type: "not found",
                notFoundName: suburbName,
                shake: true
            })

            return false
        }

        if(this.guesses.has(SuburbCache.normalizeSuburbName(suburbName))) {
            // already guessed
            statusManager.setStatus({
                type: "already guessed",
                alreadyGuessedName: suburbName,
                shake: true
            })

            return false
        }

        this.addGuess(guessSuburb)

        return true
    }

    endGame(didWin: boolean) {
        this.expanded = true
        this.gameEnded = true

        if(didWin) {
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

        mixpanel.track("Game Complete", {
            win: didWin,
            guesses: [...this.guesses].map(([_, guesss]) => guesss.suburb.name),
            guessesUsed: this.guesses.size + (didWin ? 1 : 0)
        })
    }
}

const gameManager = new GameManager()

export default gameManager