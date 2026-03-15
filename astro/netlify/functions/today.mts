import type { Config } from "@netlify/functions";
import datesData from "../../src/lib/json/dates.json" assert { type: "json" };

export default async function (req: Request) {
    // Get current time in Melbourne timezone
    const now = new Date(
        new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" })
    );

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dateKey = `${year}-${month}-${day}`;

    const dates = datesData.dates as Record<string, string>;
    const suburb = dates[dateKey];

    if (!suburb) {
        return new Response(
            JSON.stringify({ error: "No suburb found for today", date: dateKey }),
            {
                status: 404,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    return new Response(
        JSON.stringify({ suburb, date: dateKey }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    );
}

export const config: Config = {
    path: "/api/today",
};
