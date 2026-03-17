import type { Position } from "geojson"


export const convertCoordinatesToGeoJsonPolygon = (coordinates: Position[][], properties?: Object): GeoJSON.Feature => {
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
