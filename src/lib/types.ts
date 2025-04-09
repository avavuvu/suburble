export type Suburb = {
    name: string,
    coordinates: Coordinates[],
    centroid: Coordinates,
    lines: MetroLines[]
}

export type TrainLine = LineStringTrainLine | MultiLineTrainLine

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