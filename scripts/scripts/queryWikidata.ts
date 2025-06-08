import { isEntityId, simplifyClaims, simplifyLabels, WBK, type EntityId, type NonNestedEntityId } from 'wikibase-sdk'
import suburbsJSON from "./json/suburbsGeo.json"

const suburbs = suburbsJSON as {
    features: 
    {
      "type": "Feature",
      "properties": {
        "@id": string,
        "admin_level": string,
        "boundary": string,
        "name": string,
        "name:zh": string,
        "population": string,
        "postal_code": string,
        "ref:psma:loc_pid": string,
        "ref:vicmap:pfi": string,
        "type": string,
        "wikidata": string,
        "wikipedia": string
      }
    }[]
}

type IdData = {
    id: EntityId,
    name: string
}

const ids: IdData[] = suburbs.features.map(suburb => {
    const id = suburb.properties.wikidata

    if(isEntityId(id)) {
        return {
            id, name: suburb.properties.name
        }
    }

    return null
}).filter(id => id !== null)

const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})

const idSplitArray: IdData[][] = []
for (let index = 0; index < ids.length; index += 50) {
    idSplitArray.push(ids.slice(index, index + 50))
}

const otherData: {name: string, population: number}[] = []

let max = -1

let totalIterations = -1
for(const idSection of idSplitArray) {
    if( totalIterations > max) { break } 

    const url = wdk.getEntities({
        ids: idSection.map(data => data.id),
        languages: ["en"],
        format: "json",
        redirects: true,
    })
    
    const response = await fetch(url)
    const json = await response.json()
    
    let index = 0
    for (const entry of Object.entries(json.entities)) {


        const name = idSection[index].name

        const [, data] = entry as [string, any]
        const claims = simplifyClaims(data.claims)
        const imageTitles = claims["P18"] as string[] | undefined
        const latestPopulation: number | undefined = claims["P1082"]?.at(-1) as number

        otherData.push({
            name, population: latestPopulation
        })
    
        if(imageTitles) {        
            const imageUrls = imageTitles.map(imageTitle => {
                const cleanedName = imageTitle.replaceAll(" ","_")
    
                const hasher = new Bun.CryptoHasher("md5")
                hasher.update(cleanedName)
                const hash = hasher.digest("hex")
     
                const char0 = hash[0]
                const char1 = hash[1]

                return `https://upload.wikimedia.org/wikipedia/commons/${char0}/${char0}${char1}/${cleanedName}`
            })
    
            const fetchRequests = imageUrls.map((url) => fetch(url) )
            const responses = await Promise.all(fetchRequests)
            const blobs = await Promise.all(responses.map(response => response.blob()))
    
            for (let index = 0; index < blobs.length; index++) {
                const blob = blobs[index];
                const extension = imageTitles[index].split(".").at(-1)!.toLowerCase()
    
                await Bun.write(`./downloads/${name}/${index}.${extension}`, blob)
                
            }
        }

        index ++;
        if(totalIterations !== -1) {
            totalIterations ++
        }
    }
}
await Bun.write(`./output/population.json`, JSON.stringify(otherData))
