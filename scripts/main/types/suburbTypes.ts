import type { Point, Position } from "geojson";
import type { TrainLineName } from "./trainTypes";
import type { Cardinal } from "./directionTypes";

export type Suburb = {
    name: string,
    coordinates: Position[][],
    centroid: Position,
    trainLines: TrainLineName[],
    languageOfOrigin?: string,
    directionFromCBD?: Cardinal
}


export type OSMSuburbPropertiwes = {
    "@id": string,
    "admin_level": string,
    "boundary": string,
    "name": string,
    "name:zh": string,
    "population": string,
    "postal_code": string,
    "ref:psma:loc_pid": string,
    "ref:vicmap:pfi": string,
    "type": string,
    "wikidata": string,
    "wikipedia": string
}

