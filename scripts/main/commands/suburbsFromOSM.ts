import { centroid as getCentroid, simplify } from "@turf/turf"
import type { OSMSuburbPropertiwes as OSMSuburbProperties, Suburb } from "../types/suburbTypes"
import type { Polygon } from "geojson"

function deriveSuburbsFromGeoJson (suburbGeoJson: GeoJSON.FeatureCollection) {
    const suburbs: Suburb[] = suburbGeoJson.features
        .filter(geoJson => {
            // @relations exists for labels, which we arent interested
            // because it doesnt contain any actual geographic data
            return geoJson.properties && !("@relations" in geoJson.properties)
        })
        .map((geoJson) => {
            if(geoJson.geometry.type !== "Polygon") {
                console.log(geoJson.properties)
                throw new Error("Suburb GeoJson data is not a polygon!")
            }

            const polygon = simplify(geoJson.geometry, {
                highQuality: true,
                tolerance: 0.00007,
            }) as Polygon
    
            const coordinates = polygon.coordinates
            
            const centroid = getCentroid(geoJson).geometry.coordinates
    
            const properties = geoJson.properties as OSMSuburbProperties
    
            const name = properties.name
            
            return {
                centroid, coordinates, name,
                trainLines: []
            }
        }
    )

    return suburbs
}

export default deriveSuburbsFromGeoJson