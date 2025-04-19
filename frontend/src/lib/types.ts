export type Suburb = {
    name: string,
    coordinates: Coordinates[],
    centroid: Coordinates,
    lines: (MetroLines | TramLines)[]
}

export type PTVLine = LineStringTrainLine | MultiLineTrainLine

type LineStringTrainLine = {
    name: string,
    coordinates: Coordinates[],
    type: "LineString"
}

type MultiLineTrainLine = {
    name: string,
    coordinates: GeoJSON.Position[][],
    type: "MultiLineString"
}

export type Coordinates = [number, number]

export const metroLines = [
    "Mernda", "Hurstbridge",
    "Sunbury", "Craigieburn", "Upfield",
    "Lilydale","Belgrave","Glen Waverley","Alamein",
    "Pakenham","Cranbourne",
    "Sandringham",
    "Frankston","Williamstown","Werribee",
] as const

export type MetroLines = typeof metroLines[number];

export const trainLines = [
    "Route 1", "Route 3", "Route 5", "Route 6",
    "Route 11", "Route 12", "Route 16", "Route 19",
    "Route 30", "Route 35", "Route 48", "Route 57",
    "Route 58", "Route 59", "Route 64", "Route 67",
    "Route 70", "Route 72", "Route 75", "Route 78",
    "Route 82", "Route 86", "Route 96", "Route 109"
] as const;

export type TramLines = typeof trainLines[number];

export type Cardinal = 
    | "North" 
    | "South" 
    | "East" 
    | "West" 
    | "North-West"
    | "South-West"
    | "North-East"
    | "South-East"

export type PTVLineName = MetroLines | TramLines

export type PTVLineOverlap = {lines: (MetroLines | TramLines)[], type: "none" | "every" | "some"}

export type AttributionDeed = "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0"

export const attribution: Record<AttributionDeed, string> = {
    "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0",
    "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0",
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0"
} as const

export type Factsheet = {
    name: string,
    housePrices?: string,
    population?: number,
    etymology?: {
        "language": string,
        "description": string
    },
    attribution?: {
        type: AttributionDeed,
        author: string
    }
}