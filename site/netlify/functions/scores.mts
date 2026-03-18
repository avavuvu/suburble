import type { Config, Context } from "@netlify/functions";
import { db } from "../../db";
import { scores } from "../../db/schema";
import { eq, avg, count, max } from "drizzle-orm";

export default async function (req: Request, context: Context): Promise<Response> {
    const { date, guesses } = context.params;

    if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const guessCount = parseInt(guesses, 10);
    if (!date || isNaN(guessCount) || guessCount < 1) {
        return Response.json({ error: "Invalid date or guesses" }, { status: 400 });
    }

    await db
        .insert(scores)
        .values({ date, guesses: guessCount, userIp: context.ip ?? null });

    const stats = await db
        .select({ guesses: scores.guesses, players: count() })
        .from(scores)
        .where(eq(scores.date, date))
        .groupBy(scores.guesses)
        .orderBy(scores.guesses);

    const [meta] = await db
        .select({ count: avg(scores.guesses), max: max(scores.guesses) })
        .from(scores)
        .where(eq(scores.date, date));

    const histogram = Object.fromEntries(
        stats.map((row) => [row.guesses, Number(row.players)])
    );

    return Response.json({ success: true, histogram, meta }, { status: 201 });
};

export const config: Config = {
    path: "/scores/:date/:guesses",
};