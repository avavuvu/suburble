import type { TrainLineName } from "../types/trainLine";

function getTrainLineName(trainLine: TrainLineName) {
    if (trainLine === "Altona Loop") {
        return "Atona Loop"
    }

    return `${trainLine} Line`
}

export default getTrainLineName
