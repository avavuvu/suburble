import type { Table } from "dexie"
import Dexie from "dexie"
import type { GameInstance } from "./gameManager.svelte.ts"
import type { RevealData } from "./types/guess"

class StreakDatabase extends Dexie {
    streak!: Table<Streak>

    constructor() {
        super('streak')

        this.version(1).stores({
            streak: "date"
        })
    }
}

type Streak = {
    date: string
    win: boolean,
    guesses: number,
    suburbName: string
}

function getDayDistance(date1: Date, date2: Date): number {
    // Calculate the absolute difference in milliseconds
    const diffTime = Math.abs(date2.getTime() - date1.getTime());

    // Convert milliseconds to full days (24-hour periods)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

class SaveManager {
    database = new StreakDatabase()

    getGameProgress(dateKey: string): { guesses: string[], isFinished: boolean } | null {
        try {
            const data = localStorage.getItem(`suburble-save-${dateKey}`)
            if (data) {
                return JSON.parse(data)
            }
        } catch (e) {
            console.error("Failed to read game progress", e)
        }
        return null
    }

    saveGameProgress(dateKey: string, guesses: string[], isFinished: boolean) {
        try {
            localStorage.setItem(`suburble-save-${dateKey}`, JSON.stringify({ guesses, isFinished }))
        } catch (e) {
            console.error("Failed to save game progress", e)
        }
    }

    async addGame(gameInstance: GameInstance, revealData: RevealData) {
        const key = gameInstance.dateKey

        const data: Streak = {
            date: key,
            win: revealData.didWin,
            suburbName: gameInstance.targetSuburb.name,
            guesses: revealData.guesses
        }

        try {
            await this.database.streak.put(data)
        }
        catch (e) {
            console.error(e)
        }
    }

    async hasPlayedToday(dateKey: string) {

        const today = await this.database.streak.get(dateKey)

        return today ? true : false
    }

    async getStreak() {
        const streaks = await this.database.streak.toArray()
        streaks.reverse()

        const lastStreak = streaks[0]
        if (!lastStreak) {
            return {
                count: 0, streaks: [], dayDistance: null
            }
        }

        const lastDate = new Date(lastStreak.date)
        const todaysDate = new Date()
        const dayDistance = getDayDistance(lastDate, todaysDate)

        if (dayDistance < 2) {
            let mostRecentDate = lastDate
            let count = 1

            for (const streak of streaks) {
                const thisDate = new Date(streak.date)
                if (streak.win && getDayDistance(mostRecentDate, thisDate) === 2) {
                    mostRecentDate = thisDate
                    count++
                    continue
                }

                break
            }

            return {
                count,
                streaks,
                dayDistance
            }
        }

        return {
            count: 0, streaks: [], dayDistance
        }
    }

    async getStats() {
        const streaks = await this.database.streak.toArray()

        let stats = { wins: 0, losses: 0 }
        for (const streak of streaks) {
            if (streak.win) {
                stats.wins++
            } else {
                stats.losses++
            }
        }

        return stats
    }
}

export const saveManager = new SaveManager()
