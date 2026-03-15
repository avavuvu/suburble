import type { APIRoute } from 'astro';
import { SuburbCache } from '@lib/suburbCache';
import type { Suburb } from '@t/suburb';
import suburbJson from '@j/suburbs.json';

const suburbs = (suburbJson as unknown) as Suburb[];

export function getStaticPaths() {
    return suburbs.map((suburb) => ({
        params: { suburb: SuburbCache.normalizeSuburbName(suburb.name) },
    }));
}

export const GET: APIRoute = ({ params }) => {
    const suburbParam = params.suburb;
    const suburb = suburbs.find(s =>
        SuburbCache.normalizeSuburbName(s.name) === SuburbCache.normalizeSuburbName(suburbParam as string)
    );

    if (!suburb) {
        return new Response(JSON.stringify({
            ok: false,
            error: "Unknown suburb"
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(
        JSON.stringify({
            ok: true,
            suburb
        }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    }
    );
}
