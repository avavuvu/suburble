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
import suburbGeoJsonFile from "../geoJson/2026/suburbs.geo.json"
import trainGeoJsonFile from "../geoJson/2026/trains.geo.json"
import deriveSuburbsFromGeoJson from "./commands/suburbsFromOSM"
import deriveTrainLinesFromGeoJson from "./commands/trainLinesFromOSM"
import assignTrainLinesToSuburbs from "./commands/assignTrainLinesToSuburbs"
import type { TrainLine, TrainLineName } from "./types/trainTypes"
import splitAtFlindersSt from "./commands/splitAtFlindersSt"
import filterEtymologies from "./commands/filterEtymologies"
import filterHousePrices from "./commands/filterHousePrices"
import queryWikidataForFacts from "./commands/queryWikidataForFacts"
import { imageAttribution } from "./consts/attribution"
import directionFromCBD from "./commands/directionFromCBD"
import checkForImages from "./commands/checkForImages"
import trainLinesToGeoJson from "./commands/trainLinesToGeoJson"
import truncatePastBacchusMarsh from "./commands/truncatePastBacchusMarsh"
import suburbsToGeoJson from "./commands/suburbToGeoJson"

// Suburbs
const suburbs = deriveSuburbsFromGeoJson(suburbGeoJsonFile as FeatureCollection)

const trainLines = deriveTrainLinesFromGeoJson(trainGeoJsonFile as FeatureCollection, {
    returnGeoJson: false,
    debugProperties: true
}) as TrainLine[]

type LinesAccumulator = {
    munnelLines: TrainLine[];
    pinkLines: TrainLine[];
    otherLines: TrainLine[];
}


const { munnelLines, pinkLines, otherLines } = trainLines.reduce<LinesAccumulator>(
    (acc, trainLine) => {
        if ((["Sunbury", "Cranbourne", "East Pakenham"] as TrainLineName[]).includes(trainLine.name)) {
            acc.munnelLines.push(trainLine);
        } else if ((["Altona Loop", "Werribee", "Williamstown", "Sandringham"] as TrainLineName[]).includes(trainLine.name)) {
            acc.pinkLines.push(trainLine)
        } else {
            acc.otherLines.push(trainLine);
        }
        return acc;
    },
    { munnelLines: [], pinkLines: [], otherLines: [] }
);

const pinkLinesSplit = splitAtFlindersSt(
    pinkLines,
    { direction: "east", name: "Sandringham" }
)

const munnelLinesSplit = splitAtFlindersSt(
    munnelLines,
    { direction: "west", name: "Sunbury" }
)

const allTrainLines = [...otherLines, ...munnelLinesSplit, ...pinkLinesSplit]
    .map(trainLine => {
        if (trainLine.name === "Ballarat") {
            return truncatePastBacchusMarsh(trainLine)
        }

        return trainLine
    })

await Bun.write(`./scripts/output/test/trainlines.geojson`, JSON.stringify(
    trainLinesToGeoJson(allTrainLines)
))

const assignedSuburbs = assignTrainLinesToSuburbs(
    suburbs,
    allTrainLines,
    {
        exclusionCutoff: 10,
        suburbCutoff: 2,
        innerCityCutoff: 5.5,
        cityCutoff: 1.5,
        overrides: {
            "Glen Iris": ["Alamein", "Glen Waverley"],
            "Camberwell": ["Alamein", "Belgrave", "Lilydale"],
            "Bundoora": ["Hurstbridge"],
            "Fitzroy": ["Mernda", "Hurstbridge"],
            "Altona": ["Altona Loop", "Werribee"],
            "Altona North": ["Altona Loop", "Werribee"],
            "Williamstown": ["Williamstown"],
            "Deer Park": ["Geelong", "Ballarat"],
            "Kew East": ["Hurstbridge", "Belgrave"],
            // ^ i think this is uniquely bugged? for some reason cranbourne/pakenham comes up?

        }
    })

await Bun.write(`./scripts/output/test/suburbs.geojson`, JSON.stringify(
    suburbsToGeoJson(assignedSuburbs)
))

// Fact Sheet
const populations = await queryWikidataForFacts(suburbGeoJsonFile as FeatureCollection, { save: true })
const etymologies = await filterEtymologies(assignedSuburbs, { save: true })
const housePrices = await filterHousePrices(assignedSuburbs, { save: true })
const images = await checkForImages(assignedSuburbs, {
    imageFolder: "./scripts/downloads"
})

const factSheet = assignedSuburbs.map(({ name }) => {
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

const suburbsWithLangugageOfOrigin = assignedSuburbs.map((suburb) => {
    const etymology = etymologies[suburb.name.toLowerCase()]?.language

    return {
        ...suburb,
        languageOfOrigin: etymology
    }

})

const suburbsWithDirection = directionFromCBD(suburbsWithLangugageOfOrigin)

await Bun.write(`./scripts/output/final/factSheet.json`, JSON.stringify(factSheet))
await Bun.write(`./scripts/output/final/trainLines.json`, JSON.stringify(allTrainLines))
await Bun.write(`./scripts/output/final/suburbs.json`, JSON.stringify(suburbsWithDirection))
await Bun.write(`./scripts/output/final/suburbNames.json`, JSON.stringify(assignedSuburbs.map(({ name }) => name)))



