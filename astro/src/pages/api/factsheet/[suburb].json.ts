import type { APIRoute } from 'astro';
import { SuburbCache } from '@lib/suburbCache';
import type { FactSheet } from '@t/faceSheet';
import factSheetJson from '@j/factSheet.json';

const factSheets = (factSheetJson as unknown) as FactSheet[];

export function getStaticPaths() {
    return factSheets.map((suburb) => ({
        params: { suburb: SuburbCache.normalizeSuburbName(suburb.name) },
    }));
}

export const GET: APIRoute = ({ params }) => {
    const suburbParam = params.suburb;
    const suburb = factSheets.find(s =>
        SuburbCache.normalizeSuburbName(s.name) === SuburbCache.normalizeSuburbName(suburbParam as string)
    );

    if (!suburb) {
        return new Response(JSON.stringify({ error: "Unknown suburb" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(suburb), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
