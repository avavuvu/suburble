import suburbsJson from "../output/mappedSuburbs.json"

export type Suburb = {
    name: string,
}

await Bun.write("./output/suburbNames.json", JSON.stringify(suburbsJson.map(suburb => suburb.name)))