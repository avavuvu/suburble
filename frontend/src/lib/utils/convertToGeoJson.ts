import type { Coordinate } from "@t/geoJson"


export const convertCoordinatesToGeoJsonPolygon = (coordinates: Coordinate[][], properties?: Object): GeoJSON.Feature => {
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates
        },
        properties: {
            ...properties
        }
    }
}

export const convertCoordinatesToGeoJsonLine = (coordinates: number[][], properties?: Object): GeoJSON.Feature => {
    return {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates
        },
        properties: {
            ...properties
        }
    }
}