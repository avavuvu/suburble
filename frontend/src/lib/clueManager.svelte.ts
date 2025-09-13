import type { Suburb } from "@t/suburb";
import { writable } from "svelte/store";
import feedManager from "./feedManager.svelte";

const suburbNameParts = [
    "vill",
    "hill",
    "ford",
    "creek",
    "heights",
    "field",
    "meadows",
    "bark",
    "town",
    "park",
    "vale",
    "bourne",
    "dale",
    "lyn",
    "mount",
    "mont",
    "wood",
    "port",
    "glen",
    "bank",
    "downs",
    "don",
    "borough",
    "spring",
    "ton",
    "land",
    "burg",
] as const

export type ClueTypes = "etymology" | "starts with" | "contains" | "word count" | "direction" | "random letters"

export type Clues = {[clue in ClueTypes]?: string}

export function getClues(suburb: Suburb) {
    const clues: Clues = {}

    if(suburb.directionFromCBD) {
        clues["direction"] = `The mystery suburb is <b>${suburb.directionFromCBD}</b> of the CBD`
    }

    if(suburb.languageOfOrigin) {
        if(suburb.languageOfOrigin.includes("Indigenous")) {
            clues["etymology"] = `The mystery suburb's name comes from an <b>Indigenous</b> language`
        } else if(suburb.languageOfOrigin.includes("German")) {
            clues["etymology"] = `The mystery suburb's name comes from <b>German</b>`
        }else if(suburb.languageOfOrigin.includes("French")) {
            clues["etymology"] = `The mystery suburb's name comes from <b>French</b>`
        }
    }

    const part = suburbNameParts.find(part => suburb.name.toLocaleLowerCase().includes(part))

    if(part) {
        clues["contains"] = `The mystery suburb's name contains the phrase: <b>"${part}"</b>`
    }

    const splitLength = suburb.name.split(" ").length
    const splitLengthMap = {
        1: "one word",
        2: "two words",
        3: "three words",
        4: "four words" // gotta account for nar nar goon north
    }
    clues["word count"] = `The mystery suburb's name is <b>${splitLengthMap[splitLength as 1 | 2 | 3 | 4]} long</b>`

    clues["starts with"] = `The mystery suburb's name starts with the letter <b>'${suburb.name.slice(0,1).toUpperCase()}'</b>`
    
    const uniqueLetters = [...new Set(suburb.name.toLowerCase().slice(1).split('').filter(letter => letter !== " "))]
    const rotateBy = suburb.name.length % uniqueLetters.length;
    const rotated = [...uniqueLetters.slice(rotateBy), ...uniqueLetters.slice(0, rotateBy)]
        .map(letter => letter.toUpperCase())

    const randomLetters = rotated.slice(0,5)
    clues["random letters"] = `The mystery suburb's name contains the letters: <b>${
        randomLetters.slice(0,-1).join(", ")
    }, and ${randomLetters.slice(-1)}</b>`

    return clues
}

const ordinalMap = {
    1: "First",
    2: "Second",
    3: "Third",
    4: "Fourth",
    5: "Fifth"
} as const

export class ClueManager {
    clues: Clues 
    clueStore = $state<null | {
        revealText: string,
    }>(null)
    clueCount = $state(0)
    clueText = $state("")

    constructor(suburb: Suburb) {
        this.clues = getClues(suburb)
    }

    public loadClue(clue: string) {
        this.clueCount ++
        const clueOrdinal = ordinalMap[this.clueCount as 1 | 2 | 3 | 4 | 5];
        this.clueStore = {
            revealText: `Reveal the ${clueOrdinal} Clue`,
        }
        this.clueText = clue
    }

    public unloadClue(showClue: boolean) {
        if(showClue) {
            feedManager.addClue(this.clueText)
        }

        this.clueStore = null
    }

    public getPriorityClue(): { clue: string; updatedClues: Clues } | null {
        // Check for priority clues in order of preference
        const priorityOrder: ClueTypes[] = [
            "direction", 
            "etymology",
            "contains", // a suburb name will very rarely come from an indigious name, and contain one of the listed parts
            "starts with",
            "random letters",
        ];
        
        for (const clueType of priorityOrder) {
            if (this.clues[clueType]) {
                const clueValue = this.clues[clueType]!;
                const updatedClues = { ...this.clues };
                delete this.clues[clueType];
                
                return {
                    clue: clueValue,
                    updatedClues
                }
            }
        }
        
        return null;
    }

    public getAnyClue(): { clue: string; updatedClues: Clues } | null {
        const remainingClueTypes = Object.keys(this.clues) as ClueTypes[];
        
        if (remainingClueTypes.length === 0) {
            return null
        }

        const clueType = remainingClueTypes[0];
        const clueValue = this.clues[clueType]!;
        const updatedClues = { ...this.clues };
        delete this.clues[clueType];

        return {
            clue: clueValue,
            updatedClues
        }
    }

}
