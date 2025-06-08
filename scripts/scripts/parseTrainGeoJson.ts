export const routeToLineMap: {[key: string]: string} = {
    "Flinders Street Glen Waverley": "Glen Waverley",
    "Belgrave Flinders Street": "Belgrave",
    "Alamein Flinders Street": "Alamein",
    "Lilydale Flinders Street": "Lilydale",
    "Flinders Street Cranbourne": "Cranbourne",
    "Frankston Williamstown": "Frankston", // or Williamstown - this one is ambiguous
    // "Stony Point Frankston": "Frankston",
    "Frankston Laverton": "Frankston",
    "Flinders Street Werribee": "Werribee",
    "Werribee Frankston": "Frankston", // or Frankston - ambiguous
    "Flinders Street East Pakenham": "Pakenham",
    "Sandringham Flinders Street": "Sandringham",
    "Mernda Flinders Street": "Mernda",
    "Hurstbridge Flinders Street": "Hurstbridge",
    "Dandenong Cranbourne": "Cranbourne",
    "Sunbury Flinders Street": "Sunbury",
    "Upfield Flinders Street": "Upfield",
    "Craigieburn Flinders Street": "Craigieburn"
};

export type TrainLine = {
    name: string,
    coordinates: Coordinates[],
}

const parseTrainGeoJson = (
    type: "Train" | "Tram",
    trainsGeoJson: AllGeoJSON, 
    exportAsGeoJson = true, 
    simplifyData = true, 
    routeMap: {[key: string]: string} = routeToLineMap) => {

    if(trainsGeoJson.type !== "FeatureCollection") {
        console.error("Not of type Feature Collection")
        return
    }

    const features: any[] = []

    const toFromCombinations: string[] = []
    
    for(const feature of trainsGeoJson.features) {

        const relations = feature.properties!['@relations']
        
        if(!relations) { 
            const name = feature!.properties!["name"]
            let geometry = feature.geometry
            const desintionTo = feature.properties!["to"]
            const desintionFrom = feature.properties!["from"]
            const toFromCombo = `${desintionTo} ${desintionFrom}`
            const fromToCombo = `${desintionFrom} ${desintionTo}`

            if(type === "Tram") {
                const routeNumber: string = feature.properties!["ref"]
                if(routeNumber.includes("d") || routeNumber.includes("a") || routeNumber.includes("b")) {
                    //ignore depot / a / b routes
                    continue
                }
            }

            const existingCombination = toFromCombinations.find((combo) => {
                return combo === toFromCombo 
                    || combo === fromToCombo
            })

            if(existingCombination) {
                console.log("Combo already exists!", existingCombination)
                continue
            }

            toFromCombinations.push(toFromCombo )

            let relevantRoute: string | undefined
            if(type === "Train") {
                relevantRoute = routeMap[toFromCombo] ?? routeMap[fromToCombo]
            } else {
                relevantRoute = `Route ${feature.properties!["ref"]}`
            }

            if(!relevantRoute) {
                console.log("No relevant route found for", toFromCombo)
                continue
            }

            if(geometry.type === "MultiLineString") {
                let longestCoordinateArray: GeoJSON.Position[] = []
                
                for(const coordinates of geometry.coordinates) {
                    if(coordinates.length > longestCoordinateArray.length) {
                        longestCoordinateArray = coordinates
                    }
                }

                geometry = createGeometry("LineString", longestCoordinateArray)
            } else {
                console.log(relevantRoute, "Is not a Multi Line String")
            }
 
            const newFeature = createFeature(geometry, {
                route: relevantRoute,
                // createdFrom: name
            })

            features.push(newFeature)
        }
    }

    const featureCollection = createFeatureCollection(features)

    if(simplifyData) { 
        simplify(featureCollection!, {
            highQuality: true,
            tolerance: 0.00007,
            mutate: true
        })
    }

    if(exportAsGeoJson) {
        return featureCollection
    }

    return featureCollection!.features.map((feature) => {
        const route = feature.properties!["route"]

        if(feature.geometry.type !== "LineString" && feature.geometry.type !== "MultiLineString") {
            throw new Error("something happened!")
        }

        const coordinates = feature.geometry.coordinates

        const color = type === "Tram"
            ? tramLineColorMap[route as TramRoutes]
            : trainLineColorMap[route as MetroLines]
    
        return {
            name: route,
            coordinates: coordinates,
            type: feature.geometry.type,
            color
        }
    })
}

export const metroLines = [
    "Mernda", "Hurstbridge",
    "Sunbury", "Craigieburn", "Upfield",
    "Lilydale","Belgrave","Glen Waverley","Alamein",
    "Pakenham","Cranbourne",
    "Sandringham",
    "Frankston","Williamstown","Werribee",
] as const

export type MetroLines = typeof metroLines[number];

const trainLineColorMap: Record<MetroLines, string> = {
    "Alamein": "#152C6B",
    "Belgrave": "#152C6B",
    "Lilydale": "#152C6B",
    "Glen Waverley": "#152C6B",

    "Sandringham": "#F178AF",

    "Frankston": "#028430",
    "Williamstown": "#028430",
    "Werribee": "#028430",

    "Cranbourne": "#279FD5",
    "Pakenham": "#279FD5",

    "Sunbury": "#FFBE00",
    "Upfield": "#FFBE00",
    "Craigieburn": "#FFBE00",

    "Mernda": "#BE1014",
    "Hurstbridge": "#BE1014"
}

export const tramRoutes = [
    "Route 1", "Route 3", "Route 5", "Route 6",
    "Route 11", "Route 12", "Route 16", "Route 19",
    "Route 30", "Route 35", "Route 48", "Route 57",
    "Route 58", "Route 59", "Route 64", "Route 67",
    "Route 70", "Route 72", "Route 75", "Route 78",
    "Route 82", "Route 86", "Route 96", "Route 109"
] as const;

export type TramRoutes = typeof tramRoutes[number];

const tramLineColorMap: Record<TramRoutes, string> = {
    "Route 35": "#6B3529",
    "Route 1": "#B5BD00",
    "Route 3": "#8DC8E8",
    "Route 5": "#D50032",
    "Route 6": "#01426A",
    "Route 16": "#FBD872",
    "Route 64": "#00AB8E",
    "Route 67": "#956C58",
    "Route 11": "#6ECEB2",
    "Route 12": "#007E92",
    "Route 19": "#8A1B61",
    "Route 30": "#534F96",
    "Route 48": "#333434",
    "Route 109": "#E87722",
    "Route 57": "#00C1D5",
    "Route 58": "#969696",
    "Route 59": "#00653A",
    "Route 70": "#F59BBB",
    "Route 72": "#9ABEAA",
    "Route 75": "#00A9E0",
    "Route 78": "#A0A0D6",
    "Route 82": "#D2D755",
    "Route 86": "#FFB500",
    "Route 96": "#C6007E"
}

import OSMTrains from "./json/OSMtrains.json"
import { feature as createFeature, featureCollection as createFeatureCollection, simplify, geometry as createGeometry } from "@turf/turf"
import type { AllGeoJSON } from "@turf/turf"
import type { Coordinates } from "./mergeSegmentsIntoLines";

import OSMTrams from "./json/OSMTrams.json"

const featureCollection = parseTrainGeoJson("Tram", OSMTrams as AllGeoJSON, false, true)!

const bytes = await Bun.write("./output/tramLineStrings.json", JSON.stringify(featureCollection))
console.log("exported as file", bytes)