import type { GoodnessColor, Overlap } from "@t/feed"
import type { TrainLineName } from "@t/trainLine"

function getTrainLineOverlap(targetTrainLines: TrainLineName[], currentTrainLines: TrainLineName[]): Overlap {
    const overlap = currentTrainLines.filter(trainLine => targetTrainLines.includes(trainLine))

    const trainLines = new Map<TrainLineName,GoodnessColor>(currentTrainLines.map((trainLine) => {
        if(targetTrainLines.includes(trainLine)) {
            return [trainLine, "green"]
        }

        return [trainLine, "gray"]
    }))

    if(overlap.length === 0) {
        return {
            type: "phrase",
            color: "gray",
            phrase: `and the mystery suburb share no train lines`,
            trainLines
        }
    }

    if(currentTrainLines.length >= 5) {
        return {
            type: "phrase",
            color: "yellow",
            phrase: `and the mystery suburb share ${overlap.length} train line${overlap.length === 1 ? "" : "s"}`,
            trainLines
        }
    }

    return {
        type: "array",
        trainLines
    }
}

export default getTrainLineOverlap