import type { FeatureCollection, Polygon } from "geojson";
import type { Suburb } from "../types/suburbTypes";

function suburbsToGeoJson(suburbs: Suburb[]): FeatureCollection<Polygon> {
    return {
        type: "FeatureCollection",
        features: suburbs.map((suburb) => ({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: suburb.coordinates,
            },
            properties: {
                name: suburb.name,
                centroid: suburb.centroid,
                trainLines: suburb.trainLines,
                ...(suburb.languageOfOrigin && { languageOfOrigin: suburb.languageOfOrigin }),
                ...(suburb.directionFromCBD && { directionFromCBD: suburb.directionFromCBD }),
            },
        })),
    };
}

export default suburbsToGeoJson;