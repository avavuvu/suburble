import * as csv from "@std/csv"
import type { Suburb } from "../types/suburbTypes"


async function filterEtymologies(suburbs: Suburb[], options: { save: boolean }) {
    const csvFile = Bun.file("./csv/etymologies.csv")
    const csvText = await csvFile.text()

    const columns = ["PFI","LOCALITY","GAZLOC","VICNAMESID","PFI_CR","UFI","UFI_CR","UFI_OLD","NAMESAKE","BROAD_CATEGORY1","LANGUAGE","DETAILS"]
    const etymologyData = csv.parse(csvText, {
        columns
    })

    const etymologies: {[name: string]: { language: string, description: string }} = {}

    for(const suburb of suburbs) {
        const etymology = etymologyData
            .find(({GAZLOC: gazetteLocality, LOCALITY: locality}) => 
                locality.toLowerCase() === suburb.name.toLowerCase() 
                || gazetteLocality.toLowerCase() === suburb.name.toLowerCase())

        if(!etymology) {
            console.warn(suburb.name, "No etymology found!")

            continue
        }

        etymologies[suburb.name.toLowerCase()] = {
            language: etymology["LANGUAGE"],
            description: etymology["DETAILS"]
        }
    }

    if(options.save) {
        await Bun.write(`./output/etymologies.json`, JSON.stringify(etymologies))
    }

    return etymologies
}

export default filterEtymologies