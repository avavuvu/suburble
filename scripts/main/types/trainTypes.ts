import type { Position } from "geojson";
import type { TrainLineName } from "suburble-shared";

// Re-export from shared package - this is the single source of truth
export { metroLines } from "suburble-shared"
export type { TrainLineName } from "suburble-shared"

export type OSMTrainProperties = {
    "@id": string,
    "colour": string,
    "from": string,
    "name": string,
    "network": "PTV - Metropolitan Trains",
    "network:wikidata": string,
    "operator": "Metro Trains Melbourne",
    "public_transport:version": string,
    "route": "train",
    "service": "commuter",
    "to": string,
    "type": string,
    "unsigned_ref": string,
    "via": string,
    "wikidata": string,
    "wikipedia": string
}

export type TrainLine = {
    name: TrainLineName,
    coordinates: Position[],
    color: string
}