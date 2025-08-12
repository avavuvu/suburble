/*
NOTE: Using .geo.json rather than .geojson because It's annoying to import .geojson compareed to regular .json

Order of operations

Scan OSM data for suburbs
Take Name, Centroid, and Coordinates
Simplify Coordinates

Take train line coordinates from OSM
Simplify
Convert each to a line string

Assign train lines to suburbs

Get fact sheet

write to fail

Here's the json we need:
factsheet.json
suburbNames.json
suburbs.json
trainLines.json

*/

import type { FeatureCollection } from "geojson"
import suburbGeoJsonFile from "../geoJson/suburbs.geo.json"
import trainGeoJsonFile from "../geoJson/trains.geo.json"
import deriveSuburbsFromGeoJson from "./commands/suburbsFromOSM"
import deriveTrainLinesFromGeoJson from "./commands/trainLinesFromOSM"
import assignTrainLinesToSuburbs from "./commands/assignTrainLinesToSuburbs"
import type { TrainLine } from "./types/trainTypes"
import splitAtFlindersSt from "./commands/splitAtFlindersSt"
import filterEtymologies from "./commands/filterEtymologies"
import filterHousePrices from "./commands/filterHousePrices"
import queryWikidataForFacts from "./commands/queryWikidataForFacts"
import { imageAttribution } from "./consts/attribution"
import directionFromCBD from "./commands/directionFromCBD"
import checkForImages from "./commands/checkForImages"

// Suburbs
const suburbs = deriveSuburbsFromGeoJson(suburbGeoJsonFile as FeatureCollection)

// const trainLines = deriveTrainLinesFromGeoJson(trainGeoJsonFile as FeatureCollection, {
//     returnGeoJson: false,
//     debugProperties: false
// }) as TrainLine[]

// type LinesAccumulator = {
//     linesToSplit: TrainLine[];
//     otherLines: TrainLine[];
// }

// const { linesToSplit, otherLines } = trainLines.reduce<LinesAccumulator>(
//     (acc, trainLine) => {
//         if (["Frankston", "Williamstown", "Altona Loop"].includes(trainLine.name)) {
//             acc.linesToSplit.push(trainLine);
//         } else {
//             acc.otherLines.push(trainLine);
//         }
//         return acc;
//     },
//     { linesToSplit: [], otherLines: [] }
// );

// // Maybe this could be one operation if the API for splitAtFlindersSt just wanted one line
// const splitLines = splitAtFlindersSt(
//     linesToSplit,
//     { direction: "east", name: "Frankston" }
// )

// const allTrainLines = otherLines.concat(splitLines)

// const assignedSuburbs = assignTrainLinesToSuburbs(
//     suburbs, 
//     allTrainLines, 
//     {
//         exclusionCutoff: 4,
//         suburbCutoff: 2,
//         innerCityCutoff: 5.5,
//         cityCutoff: 1.5,
//         overrides: {
//             "Glen Iris": ["Alamein", "Glen Waverley"],
//             "Camberwell": ["Alamein", "Belgrave", "Lilydale"],
//             "Bundoora": ["Hurstbridge"],
//             "Fitzroy": ["Mernda", "Hurstbridge"],
//             "Altona": ["Altona Loop", "Werribee"],
//             "Altona North": ["Altona Loop", "Werribee"],
//             "Williamstown": ["Williamstown"]
//         }
//     })

// Fact Sheet
const populations = await queryWikidataForFacts(suburbGeoJsonFile as FeatureCollection, { save: true })
const etymologies = await filterEtymologies(suburbs, { save: true })
const housePrices = await filterHousePrices(suburbs, { save: true })
const images = await checkForImages(suburbs, {
    imageFolder: "./downloads"
})

const factSheet = suburbs.map(({name}) => {
    const key = name.toLowerCase()
    const population = populations[key]?.population
    const etymology = etymologies[key]
    const housePrice = housePrices[key]?.price
    const attribution = imageAttribution[key]
    const hasImage = images[key]

    return {
        name: key,
        population, etymology, housePrice, attribution, 
        ...hasImage
    }
})

const suburbsWithLangugageOfOrigin = suburbs.map((suburb) => {
    const etymology = etymologies[suburb.name.toLowerCase()]?.language

    return {
        ...suburb,
        languageOfOrigin: etymology
    }

})

const suburbsWithDirection = directionFromCBD(suburbsWithLangugageOfOrigin)


await Bun.write(`./output/final/factSheet.json`, JSON.stringify(factSheet))
// await Bun.write(`./output/final/trainLines.json`, JSON.stringify(allTrainLines))
// await Bun.write(`./output/final/suburbs.json`, JSON.stringify(suburbsWithDirection))
// await Bun.write(`./output/final/suburbNames.json`, JSON.stringify(assignedSuburbs.map(({name}) => name)))


    
