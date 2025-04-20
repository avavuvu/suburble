import Dexie from "dexie"
import type { Table } from "dexie"
import { openDB } from "idb"
import type { Suburb } from "./types"
import { PUBLIC_BASE_URL } from "$env/static/public"


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
        let suburb = await this.suburbDatabase.suburbs.get(SuburbCache.normalizeSuburbName(suburbName))

        //if suburb exists
        if(suburb) {
            return suburb as Suburb
        }

        const suburbResponse = await fetch(`/api/suburb/${SuburbCache.normalizeSuburbName(suburbName)}.json`)
        suburb = await suburbResponse.json()

        if(!suburb) {
            return null
        }

        this.add(suburb)

        return suburb as Suburb
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