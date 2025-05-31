export type Suburb = {
    name: string,
    coordinates: Coordinates[],
    centroid: Coordinates,
    lines: MetroLines[]
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


export type Cardinal = 
    | "North" 
    | "South" 
    | "East" 
    | "West" 
    | "North-West"
    | "South-West"
    | "North-East"
    | "South-East"

export type PTVLineName = MetroLines

export type PTVLineOverlap = {lines: MetroLines[], type: "none" | "every" | "some"}

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