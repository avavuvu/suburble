export const prerender = true

import { SuburbCache } from "$lib/suburbCache"
import type { Factsheet } from "$lib/types"
import factsheetJson from "../../../../json/factsheet.json"

const factsheets = (factsheetJson as unknown) as Factsheet[]

export const entries = () => {
    return factsheets.map((suburb) => ({suburb: SuburbCache.normalizeSuburbName(suburb.name)}))
}

export function GET({ params }) {
    const suburb = factsheets.find(suburb => 
        SuburbCache.normalizeSuburbName(suburb.name) === SuburbCache.normalizeSuburbName(params.suburb))
    
    if(!suburb) {
        return new Response(JSON.stringify({error: "Unknown suburb"}), {
            headers: { 'Content-Type': 'application/json' },
        });
    }   

    return new Response(JSON.stringify(suburb), {
        headers: { 'Content-Type': 'application/json' },
    });
}