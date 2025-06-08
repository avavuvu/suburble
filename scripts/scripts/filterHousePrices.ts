import suburbsJson from "../output/mappedSuburbs.json"

export type Suburb = {
    name: string,
}

export const filterHousePrices = async () => {
    const housePricesFile = Bun.file("./scripts/json/houseprices.csv")
    const housePricesString = await housePricesFile.text()
    
    const lines = housePricesString.replaceAll("\r", "").split("\n")
    const tableData = lines.map(line => line.split(","))
    
    const suburbs = suburbsJson as Suburb[]
    return suburbs
        .map(suburb => {
            const priceData = tableData.find(([name, ]) => name.toLowerCase() === suburb.name.toLowerCase())
    
            if(!priceData) {
                return null
            }
    
            return {
                name: suburb.name,
                price: priceData[1]
            }
        })
        .filter(suburb => suburb !== null)


}    
