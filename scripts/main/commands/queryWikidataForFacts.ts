import WBK, { isEntityId, simplifyClaims, type EntityId } from "wikibase-sdk"
import type { OSMSuburbPropertiwes } from "../types/suburbTypes"
import suburbGeoJsonFile from "../../geoJson/suburbs.geo.json"
import type { FeatureCollection } from "geojson"

type idData = {
    id: EntityId,
    name: string
}

// some OSM data points are missing their corresponding wikidata entry, despite it existing
const wikidataHoleFiller: { [name: string]: EntityId } = {
    "Officer South": "Q21971595"
}

async function queryWikidataForFacts(suburbGeoJson: GeoJSON.FeatureCollection, options: {
    save: boolean
}) {
    const idChunks: idData[][] = suburbGeoJson.features.reduce<idData[][]>((accumulator, suburb) => {
        if(suburb.properties && ("@relations" in suburb.properties)) {
            // this means its a label
            return accumulator
        }
        
        const properties = suburb.properties as OSMSuburbPropertiwes
        let id = properties.wikidata as EntityId

        if(!isEntityId(id)) {
            console.warn(`${properties.name}\t\t doesnt have a valid entityId: (${id})`)

            const wikidataOverride = wikidataHoleFiller[properties.name]
            
            if(!wikidataOverride) {
                return accumulator 
            }

            id = wikidataOverride
            console.warn(`${properties.name}\t\t entityId override found!\n`)
        }

        const lastArray = accumulator.at(-1)!
        
        // we split them up into 50 chunks bc of wikidata rate limits
        if(lastArray.length < 50) {
            lastArray.push({
                id,
                name: properties.name
            })
        } else {
            accumulator.push([{
                id,
                name: properties.name
            }])
        }
        
        return accumulator
    }, [[]])

    const wdk = WBK({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
    })

    const population: {[name: string]: { population: number }} = {}

    for(const idChunk of idChunks) {
        const url = wdk.getEntities({
            ids: idChunk.map(({id}) => id),
            languages: ["en"],
            format: "json",
            redirects: true
        })

        const response = await fetch(url)
        const json = await response.json()

        const entities = Object.entries(json.entities)
        for (let i = 0; i < entities.length; i++) {
            const entry = entities[i]

            const suburbName = idChunk[i].name
            const [, data] = entry as [string, any]
            const claims = simplifyClaims(data.claims)
            const latestPopulation: number | undefined = claims["P1082"]?.at(-1) as number

            population[suburbName.toLowerCase()] = { population: latestPopulation}
        }
    }

    if(options.save) {
        await Bun.write(`./output/population.json`, JSON.stringify(population))
    }

    return population
}

export default queryWikidataForFacts