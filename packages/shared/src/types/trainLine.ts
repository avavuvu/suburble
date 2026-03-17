import type { Position } from "geojson"

export const metroLines = [
    "Mernda", "Hurstbridge",                            // red
    "Craigieburn", "Upfield",                // yellow
    "Lilydale", "Belgrave", "Glen Waverley", "Alamein",    // blue
    "East Pakenham", "Cranbourne", "Sunbury",                             // light blue
    "Sandringham", "Williamstown", "Werribee", "Altona Loop", // pink
    "Frankston", // green
    "Ballarat", "Geelong",
] as const

export type TrainLineName = typeof metroLines[number]

export type TrainLine = {
    color: string,
    coordinates: Position[]
    name: TrainLineName
}
