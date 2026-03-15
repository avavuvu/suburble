import type { GoodnessColor } from "./types/feed";
import type { Guess, IncorrectGuess } from "./types/guess";
import { type TrainLineName, trainLines } from "./types/trainLine";
import { SvelteMap } from "svelte/reactivity";
import getTrainLineOverlap from "./utils/getTrainLineOverlap";
import type { Suburb } from "./types/suburb";
import { SuburbCache } from "./suburbCache";
import trainLinesGeoJson from "./json/trainLines.json"
import { convertCoordinatesToGeoJsonLine, convertCoordinatesToGeoJsonPolygon } from "./utils/convertToGeoJson";
import { getCorrectnessColor } from "./utils/getCorrectnessColor";

type TrainLineData = {
    color: GoodnessColor | null;
    geoJson: GeoJSON.Feature
};

class MapManager {
    trainLinesOnMap = new SvelteMap<TrainLineName, TrainLineData>(
        (trainLinesGeoJson as any[]).map(trainLine => [
            trainLine.name as TrainLineName,
            {
                color: null,
                geoJson: convertCoordinatesToGeoJsonLine(trainLine.coordinates)
            }
        ])
    );

    suburbsOnMap = new SvelteMap<string, {
        emoji: {
            emoji: string,
            offset?: number,
            direction: number
        },
        suburb: Suburb,
        geoJson: GeoJSON.Feature,
        color: string
    }>()

    targetTrainLines: TrainLineName[]

    map: maplibregl.Map | undefined = $state(undefined)

    constructor(targetTrainLines: TrainLineName[]) {
        this.targetTrainLines = targetTrainLines

    }

    flyToSuburb(suburb: Suburb) {
        if (!this.map) {
            throw new Error("Map is undefined!")
        }

        this.map.flyTo({
            center: suburb.centroid,
            speed: .6,
            offset: [0, -50],
            zoom: 12
        })
    }

    addGuess(guess: Guess) {
        this.flyToSuburb(guess.suburb)

        this.suburbsOnMap.set(SuburbCache.normalizeSuburbName(guess.suburb.name), {
            emoji: {
                emoji: guess.directionInfo.emojiDirection.emoji,
                offset: guess.directionInfo.emojiDirection.offset,
                direction: guess.directionInfo.directionToTarget
            },
            suburb: guess.suburb,
            geoJson: convertCoordinatesToGeoJsonPolygon(guess.suburb.coordinates),
            color: getCorrectnessColor(guess.directionInfo.distanceToTarget)
        })

        const overlap = getTrainLineOverlap(this.targetTrainLines, guess.suburb.trainLines)

        if (overlap.trainLines.size > 5) {
            // if theres more than five
            // we dont want to give away too much info
            return
        }

        for (const [trainLine, goodnessColor] of overlap.trainLines) {
            const trainLineOnMap = this.trainLinesOnMap.get(trainLine)!

            if (trainLineOnMap.color === "green") {
                // dont reset already verified lines
                continue
            }

            this.trainLinesOnMap.set(trainLine, {
                ...trainLineOnMap,
                color: goodnessColor
            })
        }
    }
}

export default MapManager
