export const prerender = true

import { SuburbCache } from "$lib/suburbCache"
import type { FactSheet } from "@t/faceSheet"
import factSheetJson from "@j/factSheet.json"

const factSheets = (factSheetJson as unknown) as FactSheet[]

export const entries = () => {
    return factSheets.map((suburb) => ({suburb: SuburbCache.normalizeSuburbName(suburb.name)}))
}

export function GET({ params }) {
    const suburb = factSheets.find(suburb => 
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