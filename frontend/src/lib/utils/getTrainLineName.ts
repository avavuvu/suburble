import type { TrainLineName } from "@t/trainLine";

function getTrainLineName(trainLine: TrainLineName) {
    if(trainLine === "Altona Loop") {
        return "Atona Loop"
    }

    return `${trainLine} Line`
}

export default getTrainLineName