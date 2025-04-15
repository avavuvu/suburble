export const prerender = true

import type { Factsheet } from "$lib/types"
import factsheetJson from "../../../../json/factsheet.json"

const factsheets = (factsheetJson as unknown) as Factsheet[]

export const entries = () => {
    return factsheets.map((suburb) => ({suburb: suburb.name.toLowerCase()}))
}

export function GET({ params }) {
    const suburb = factsheets.find(suburb => suburb.name.toLowerCase() === params.suburb.toLowerCase())
    
    if(!suburb) {
        return new Response(JSON.stringify({error: "Unknown suburb"}), {
            headers: { 'Content-Type': 'application/json' },
        });
    }   

    return new Response(JSON.stringify(suburb), {
        headers: { 'Content-Type': 'application/json' },
    });
}