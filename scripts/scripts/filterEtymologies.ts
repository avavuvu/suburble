import * as csv from "@std/csv"
import suburbsJson from "../output/mappedSuburbs.json"

export type Suburb = {
    name: string,
}

export const filterEtymologies = async () => {
    const suburbs = suburbsJson as Suburb[]

    const csvFile = Bun.file("./scripts/json/etymologies.csv")
    const csvText = await csvFile.text()

    const columns = ["PFI","LOCALITY","GAZLOC","VICNAMESID","PFI_CR","UFI","UFI_CR","UFI_OLD","NAMESAKE","BROAD_CATEGORY1","LANGUAGE","DETAILS"]
    const etymologyData = csv.parse(csvText, {
        columns
    })

    return suburbs
        .map(suburb => {
            const etymology = etymologyData
                .find(({GAZLOC: gazetteLocality, LOCALITY: locality}) => 
                    locality.toLowerCase() === suburb.name.toLowerCase() 
                    || gazetteLocality.toLowerCase() === suburb.name.toLowerCase())

            if(!etymology) {
                console.log(suburb.name, "No etymology found!")

                return null
            }

            return {
                name: suburb.name,
                etymology: {
                    language: etymology["LANGUAGE"],
                    description: etymology["DETAILS"]
                }
            }
        })
        .filter(suburb => suburb !== null)
}