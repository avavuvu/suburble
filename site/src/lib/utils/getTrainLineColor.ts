import type { TrainLineName } from "suburble-shared"
import { trainLineColorMap } from "suburble-shared"

export { trainLineColorMap }

function getTrainLineColor(trainLine: TrainLineName) {
    return trainLineColorMap[trainLine]
}

export default getTrainLineColor
