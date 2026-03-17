import type { Cardinal } from "./geo"
import { type Position } from "geojson"
import type { TrainLineName } from "./trainLine"

export type Suburb = {
    name: string,
    coordinates: Position[][],
    centroid: Position,
    trainLines: TrainLineName[],
    languageOfOrigin?: string,
    directionFromCBD?: Cardinal
}
