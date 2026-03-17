import type { FeatureCollection, Feature, LineString } from "geojson"
import type { TrainLine } from "suburble-shared"

/**
 * Converts a TrainLine[] into a GeoJSON FeatureCollection for debugging.
 * 
 * Open the output in geojson.io or a similar tool to visualize.
 */
function trainLinesToGeoJson(trainLines: TrainLine[]): FeatureCollection {
    const features: Feature<LineString>[] = trainLines.map(trainLine => ({
        type: "Feature",
        properties: {
            name: trainLine.name,
            stroke: trainLine.color,
            "stroke-width": 3,
            "stroke-opacity": 0.8
        },
        geometry: {
            type: "LineString",
            coordinates: trainLine.coordinates
        }
    }))

    return {
        type: "FeatureCollection",
        features
    }
}

export default trainLinesToGeoJson
