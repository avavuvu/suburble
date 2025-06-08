import { filterEtymologies } from "./filterEtymologies";
import { filterHousePrices } from "./filterHousePrices";
import populationJson from "./json/population.json"
import attributionJson from "./json/attribution.json"
import suburbsJson from "../output/mappedSuburbs.json"

export type Suburb = {
    name: string,
}

const populations = populationJson as unknown as {name: string, population: number}[]
const attribution = attributionJson["attribution"] as unknown as {
    name: string,
    author: string,
    type: string
}[]

const create = async () => {
    const housePrices = await filterHousePrices()
    const etymologies = await filterEtymologies()
    
    const suburbs = suburbsJson as Suburb[]
    return suburbs.map(suburb => {
        const housePrice = housePrices.find(housePrice => suburb.name.toLowerCase() === housePrice.name.toLowerCase())
        const etymology = etymologies.find(etymology => suburb.name.toLowerCase() === etymology.name.toLowerCase())
        const population = populations.find(population => suburb.name.toLowerCase() === population.name.toLowerCase())
        const imageAttribution = attribution.find(attribution => suburb.name.toLowerCase() === attribution.name.toLowerCase())

        return {
            name: suburb.name,
            housePrices: housePrice?.price,
            etymology: etymology?.etymology,
            population: population?.population,
            attribution: imageAttribution 
                ? {
                    author: imageAttribution.author,
                    type: imageAttribution.type
                }
                : undefined
        }
    })
}

await Bun.write("./output/factsheet.json", JSON.stringify(await create()))