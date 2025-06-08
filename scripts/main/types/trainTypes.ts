import type { Position } from "geojson";

export const metroLines = [
    "Mernda", "Hurstbridge",                            // red
    "Sunbury", "Craigieburn", "Upfield",                // yellow
    "Lilydale","Belgrave","Glen Waverley","Alamein",    // blue
    "Pakenham","Cranbourne",                            // light blue
    "Sandringham",                                      // pink
    "Frankston","Williamstown","Werribee","Altona Loop" // green
] as const

export type TrainLineName = typeof metroLines[number];

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