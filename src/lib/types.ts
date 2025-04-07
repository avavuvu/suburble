export type Suburb = {
    name: string,
    coordinates: Coordinates[],
    centroid: Coordinates
}

export type TrainLine = {
    name: string,
    coordinates: Coordinates[],
}

export type Coordinates = [number, number]