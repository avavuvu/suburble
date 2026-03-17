import suburbNames from "../../../site/src/lib/json/suburbNames.json" assert { type: "json" };
import datesObj from "../../../site/src/lib/json/dates.json" assert { type: "json" };
import suburbsJson from "../../../site/src/lib/json/suburbs.json" assert { type: "json" };
import distance from "@turf/distance"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIN_DISTANCE_KM = 8; // Adjust threshold if necessary
const TARGET_END_DATE = new Date("2027-12-31");
const RECENT_DAYS_BLACKLIST = 90; // Don't repeat a suburb for 90 days

const OVERRIDE_DATES: Record<string, typeof suburbNames[number]> = {
    "2026-08-23": "Yarraville",
    "2026-10-03": "Fraser Rise",
};

const createDateFile = () => {
    // 1. Get the last recorded date and suburb
    const { dates } = datesObj;
    const allDates = Object.keys(dates).sort();

    if (allDates.length === 0) {
        console.error("dates.json is empty.");
        return;
    }

    const lastDateStr = allDates.at(-1)!;
    const lastDateVal = new Date(lastDateStr);

    let lastSuburbName = dates[lastDateStr as keyof typeof dates] as string;

    // Keep track of recent suburbs to avoid close repetitions
    const recentSuburbs = allDates.slice(-RECENT_DAYS_BLACKLIST).map(d => dates[d as keyof typeof dates]);

    console.log(`Starting generation from ${lastDateStr}. Target end date: ${TARGET_END_DATE.toISOString().split("T")[0]}`);

    // Map suburbs to their centroids for fast lookups
    const subStrToCentroidMap = new Map<string, [number, number]>();
    for (const suburb of suburbsJson) {
        subStrToCentroidMap.set(suburb.name, suburb.centroid as [number, number]);
    }

    const newDatesObj: Record<string, string> = { ...dates };

    while (lastDateVal < TARGET_END_DATE) {
        // Step forward one day
        lastDateVal.setDate(lastDateVal.getDate() + 1);
        const nextDateStr = lastDateVal.toISOString().split("T")[0];

        let pickedSuburbName: string;

        if (OVERRIDE_DATES[nextDateStr]) {
            pickedSuburbName = OVERRIDE_DATES[nextDateStr];
            if (!subStrToCentroidMap.has(pickedSuburbName)) {
                console.warn(`Override suburb "${pickedSuburbName}" not found in suburbs list! Distance checks for the next day might fall back to random.`);
            }
            console.log(`> Using override for ${nextDateStr}: ${pickedSuburbName}`);
        } else {
            const lastSubCentroid = subStrToCentroidMap.get(lastSuburbName);

            // Candidate pool is all suburbs MINUS the recent ones
            const recentSet = new Set(recentSuburbs);
            let availableSuburbs = suburbNames.filter((suburb: string) => !recentSet.has(suburb));

            // Find a candidate
            let candidateIndex = -1;

            // Shuffle the available suburbs slightly so we pick randomly
            // but prefer finding one that satisfies our distance threshold
            for (let i = 0; i < availableSuburbs.length * 2; i++) {
                const randIndex = Math.floor(Math.random() * availableSuburbs.length);
                const candidateName = availableSuburbs[randIndex];
                const candidateCentroid = subStrToCentroidMap.get(candidateName)!;

                // Safely handle missing centroid from a previous manual override
                if (!lastSubCentroid) {
                    candidateIndex = randIndex;
                    break;
                }

                const dist = distance(lastSubCentroid, candidateCentroid, { units: "kilometres" });

                if (dist > MIN_DISTANCE_KM || availableSuburbs.length <= 5) {
                    // We've found a good candidate
                    candidateIndex = randIndex;
                    break;
                }
            }

            // Degrading threshold if absolutely necessary
            if (candidateIndex === -1) {
                console.warn(`Could not find a suburb > ${MIN_DISTANCE_KM}km for ${nextDateStr}. Picking randomly from whatever is available.`);
                candidateIndex = Math.floor(Math.random() * availableSuburbs.length);
            }

            pickedSuburbName = availableSuburbs[candidateIndex] as string;
        }

        // Assign
        newDatesObj[nextDateStr] = pickedSuburbName;
        lastSuburbName = pickedSuburbName;

        // Track as recent
        recentSuburbs.push(pickedSuburbName);
        if (recentSuburbs.length > RECENT_DAYS_BLACKLIST) {
            recentSuburbs.shift();
        }
    }

    // Write to dates.json
    const finalJsonStr = JSON.stringify({ dates: newDatesObj }, null, 2);

    const targetPath = path.resolve(__dirname, "../../../site/src/lib/json/dates.json");
    fs.writeFileSync(targetPath, finalJsonStr);

    console.log(`Finished writing to ${targetPath}. Last date is now ${lastDateVal.toISOString().split("T")[0]}`);
}

createDateFile();