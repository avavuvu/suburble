import type { CorrectGuess, IncorrectGuess, RevealData } from "./types/guess"
import type { DirectionInfo } from "./utils/getDirectionInformation"
import type { Cardinal } from "./types/geoJson"
import type { TrainLineName } from "./types/trainLine"
import gameManager from "./gameManager.svelte.ts"
import type { FeedClue, FeedGuess, FeedItem, FeedReveal, GoodnessColor, Overlap } from "./types/feed"
import getTrainLineOverlap from "./utils/getTrainLineOverlap"
import type { FactSheet as FactSheet } from "./types/faceSheet"
import type { Suburb } from "./types/suburb"



class FeedManager {
    feed: FeedItem[] = $state([])
    feedCount: number = $state(0)

    delayRevealTimeMs = 2000

    #addFeedItem(feedItem: FeedGuess | FeedClue | FeedReveal, delay: boolean = false) {
        const keyedFeedItem = {
            ...feedItem,
            key: this.feedCount
        }
        this.feedCount++

        if (delay) {
            setTimeout(() => {
                this.feed.unshift(keyedFeedItem);
            }, this.delayRevealTimeMs)

            return
        }

        this.feed.unshift(keyedFeedItem);
    }


    addIncorrectGuess(guess: IncorrectGuess, isLastGuess: boolean) {
        const feedItem: FeedGuess = {
            type: "guess",
            isLastGuess,
            guess,
            guessComponentsGoodness: this.getGuessComponentGoodness(guess.directionInfo),
            overlap: getTrainLineOverlap(
                gameManager.gameInstance.targetSuburb.trainLines,
                guess.suburb.trainLines)
        }

        this.#addFeedItem(feedItem)
    }

    addClue(clue: string) {
        const feedItem: FeedClue = {
            type: "clue",
            clue,
        }

        this.#addFeedItem(feedItem)
    }

    addReveal(factSheet: FactSheet, suburb: Suburb, revealData: RevealData) {
        const feedItem: FeedReveal = {
            type: "reveal",
            factSheet,
            suburb,
            revealData
        }

        this.#addFeedItem(feedItem, !revealData.didWin)
    }

    getGuessComponentGoodness(
        directionInfo: DirectionInfo): Record<keyof DirectionInfo, GoodnessColor> {

        const guessComponents: Record<keyof DirectionInfo, GoodnessColor> = {
            "cardinalToTarget": "gray",
            "directionToTarget": "gray",
            "distanceToTarget": "gray",
            "emojiDirection": "gray"
        }

        for (const [type, data] of Object.entries(directionInfo)) {
            switch (type) {
                case "cardinalToTarget":
                    const cardinal = data as Cardinal

                    guessComponents.cardinalToTarget = "gray"
                    break;
                case "distanceToTarget":
                    const distance = data as number

                    if (distance < 5) {
                        guessComponents.distanceToTarget = "yellow"
                    } else if (distance < 2) {
                        guessComponents.directionToTarget = "green"
                    } else {
                        guessComponents.distanceToTarget = "gray"

                    }

            }

        }

        return guessComponents
    }
}



const feedManager = new FeedManager()

export default feedManager
