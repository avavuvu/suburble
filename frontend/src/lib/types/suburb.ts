import type { Cardinal, Coordinate } from "./geoJson"
import type { TrainLineName } from "./trainLine"

export type Suburb = {
    name: string,
    coordinates: Coordinate[][],
    centroid: Coordinate,
    trainLines: TrainLineName[],
    languageOfOrigin?: string,
    directionFromCBD?: Cardinal
}