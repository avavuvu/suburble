import type { Suburb } from "./filterEtymologies"
import suburbsJson from "./json/suburbs.json"
import {DateTime} from "luxon"
import * as yaml from "yaml"

const suburbs = (suburbsJson as Suburb[])
    .map(suburb => suburb.name)

function shuffleArray(array: string[]) {
    const newArray = [...array]; // Create a copy to avoid mutating original
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
    }
    return newArray;
    }

const suburbsShuffled = shuffleArray(suburbs)

function assignSuburbsToDates() {
    let dates: {[key: string]: string} = {}
    
    Array.from({ length: suburbsShuffled.length }, (_, i) => 
    {
        dates[DateTime.now().plus({ days: i }).toFormat('yyyy-MM-dd')] = suburbsShuffled[i]
    
    })

    return dates
}


await Bun.write("./output/dates.yaml", yaml.stringify({
    dates: assignSuburbsToDates()
}))

console.log()