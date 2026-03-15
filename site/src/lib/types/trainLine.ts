import type { Coordinate } from "./geoJson"

export type TrainLine = {
    color: string,
    coordinates: Coordinate[]
    name: TrainLineName
}

export const trainLines = [
    "Mernda", "Hurstbridge",
    "Sunbury", "Craigieburn", "Upfield",
    "Lilydale","Belgrave","Glen Waverley","Alamein",
    "Pakenham","Cranbourne",
    "Sandringham",
    "Frankston","Williamstown","Werribee","Altona Loop"
] as const

export type TrainLineName = typeof trainLines[number];