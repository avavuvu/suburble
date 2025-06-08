import type { Suburb } from "../types/suburbTypes"

async function filterHousePrices(suburbs: Suburb[], options: { save: boolean }) {
    const housePricesFile = Bun.file("./csv/houseprices.csv")
    const housePricesString = await housePricesFile.text()
    
    const lines = housePricesString.replaceAll("\r", "").split("\n")
    const tableData = lines.map(line => line.split(","))

    const housePrices: {[name: string]: {price: string}} = {}

    for(const suburb of suburbs) {
        const priceData = tableData
            .find(([name, ]) => name.toLowerCase() === suburb.name.toLowerCase())

        if(!priceData) {
            continue
        }

        housePrices[suburb.name.toLowerCase()] = {
            price: priceData[1]
        }
    }

    if(options.save) {
        await Bun.write(`./output/houseprices.json`, JSON.stringify(housePrices))
    }

    return housePrices
}    

export default filterHousePrices