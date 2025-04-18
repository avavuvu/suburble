import type { Coordinates } from "./types"

export const convertCoordinatesToGeoJsonPolygon = (coordinates: Coordinates[], properties?: Object) => {
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates
        },
        properties
    }
}

export const convertCoordinatesToGeoJsonLine = (coordinates: Coordinates[], properties?: Object) => {
    return {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates
        },
        properties
    }
}