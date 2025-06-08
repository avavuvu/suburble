import Dexie from "dexie"
import type { Table } from "dexie"
import type { Suburb } from "@t/suburb"

class SuburbDatabase extends Dexie {
    suburbs!: Table<Suburb & { key: string }>

    constructor() {
        super('suburbs')

        this.version(1).stores({
            suburbs: "key"
        })
    }
}

export class SuburbCache {
    suburbDatabase = new SuburbDatabase()

    static normalizeSuburbName(suburbName: string) {
        return suburbName.toLowerCase().replaceAll(" ", "-")
    }

    async get(suburbName: string): Promise<Suburb | null> {
        if(suburbName === "") {
            return null
        }

        suburbName = SuburbCache.normalizeSuburbName(suburbName)
        let suburb = await this.suburbDatabase.suburbs.get(suburbName)

        //if suburb exists
        if(suburb) {
            return suburb as Suburb
        }

        const suburbResponse = await fetch(`/api/suburb/${suburbName}.json`)
        const suburbData: {
            ok: boolean,
            suburb: Suburb
        } = await suburbResponse.json()

        if(!suburbData.ok) {
            return null
        }

        this.add(suburbData.suburb)

        return suburbData.suburb as Suburb
    }

    async add(suburb: Suburb) {
        let suburbAlreadyExists = await this.suburbDatabase.suburbs.get(SuburbCache.normalizeSuburbName(suburb.name))

        if(suburbAlreadyExists) { 
            return
        }

        await this.suburbDatabase.suburbs.add({
            ...suburb,
            key: SuburbCache.normalizeSuburbName(suburb.name)
        })
        
    }
}

export const suburbCache = new SuburbCache()