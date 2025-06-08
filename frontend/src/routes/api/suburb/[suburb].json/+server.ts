export const prerender = true

import { SuburbCache } from "$lib/suburbCache"
import type { Suburb } from "@t/suburb"
import suburbJson from "@j/suburbs.json"
import type { EntryGenerator } from "./$types.js"
const suburbs = (suburbJson as unknown) as Suburb[]

export const entries: EntryGenerator = () => {
    return suburbs.map((suburb) => ({suburb: SuburbCache.normalizeSuburbName(suburb.name)}))
}

export function GET({ params }) {
    const suburb = suburbs.find(suburb => 
        SuburbCache.normalizeSuburbName(suburb.name) === SuburbCache.normalizeSuburbName(params.suburb))
    
    if(!suburb) {
        return new Response(JSON.stringify({
            ok: false,
            error: "Unknown suburb"
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }   

    return new Response(
            JSON.stringify({
            ok: true, 
            suburb
        }), {
            headers: { 'Content-Type': 'application/json' },
        }
    );
}