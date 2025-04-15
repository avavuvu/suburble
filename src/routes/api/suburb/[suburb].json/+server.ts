export const prerender = true

import type { Suburb } from "$lib/types.js"
import type { RouteParams } from "../$types"
import suburbJson from "../../../../json/suburbs.json"
import type { EntryGenerator } from "./$types.js"
const suburbs = (suburbJson as unknown) as Suburb[]

export const entries: EntryGenerator = () => {
    return suburbs.map((suburb) => ({suburb: suburb.name.toLowerCase()}))
}

export function GET({ params }) {
    const suburb = suburbs.find(suburb => suburb.name.toLowerCase() === params.suburb.toLowerCase())
    
    if(!suburb) {
        return new Response(JSON.stringify({error: "Unknown suburb"}), {
            headers: { 'Content-Type': 'application/json' },
        });
    }   

    return new Response(JSON.stringify(suburb), {
        headers: { 'Content-Type': 'application/json' },
    });
}