
import type { Feature, FeatureCollection, GeoJsonProperties, LineString } from "geojson"
import trainsGeoJson from "../../geoJson/trains.geo.json"
import { 
    simplify, 
    lineString as createLineString,
    featureCollection as createFeatureCollection, 
    center as findCenter,
    bearing as findBearing,} from "@turf/turf"
import type { OSMTrainProperties, TrainLine, TrainLineName } from "../types/trainTypes"
import routeToLineMap from "../consts/routeToLineMap"
import trainLineColorMap from "../consts/trainColors"

interface DeriveTrainLineOptions {
    returnGeoJson: boolean
    debugProperties: boolean
}

function deriveTrainLinesFromGeoJson(
    geoJson: GeoJSON.FeatureCollection, 
    options: DeriveTrainLineOptions = { 
        returnGeoJson: false ,
        debugProperties: false
    }) : TrainLine[] | FeatureCollection {
 
    const toFromCombinations: string[] = []
    
    const trainLines: Feature<LineString>[] = geoJson.features
        .filter(geoJson => 
                geoJson.geometry.type === "LineString" ||
                geoJson.geometry.type === "MultiLineString")
        .flatMap(geoJson => {
            const properties = geoJson.properties as OSMTrainProperties
            const desintionTo = properties["to"]
            const desintionFrom = properties["from"]
            const toFromCombo = `${desintionTo}<->${desintionFrom}`
            const fromToCombo = `${desintionFrom}<->${desintionTo}`

            const existingCombination = toFromCombinations.find((combo) => {
                return combo === toFromCombo 
                    || combo === fromToCombo
            })

            if(existingCombination) {
                // console.log("Combo already exists!", existingCombination)
                return []
            }

            toFromCombinations.push(toFromCombo)

            const routeName = routeToLineMap[toFromCombo] ?? routeToLineMap[fromToCombo]

            if(!routeName) {
                return []
            }

            geoJson.properties = {
                name: routeName
            }

            if(options.debugProperties) {
                geoJson.properties["derivedFrom"] = toFromCombo
                geoJson.properties["stroke-width"] = 5
                geoJson.properties["stroke-opacity"] = .5
                geoJson.properties["stroke"] = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
            }

            return geoJson
        })
        .map((geoJson) => {
            let lineString = geoJson as Feature<LineString>

            // For the OSM data, some train lines are multi lines because they contain the route
            // And also station platform outlines that are represented as lines
            if (geoJson.geometry.type === "MultiLineString") {
                let longestLine: GeoJSON.Position[] = []
                geoJson.geometry.coordinates.forEach(positions => {
                    if (positions.length > longestLine.length) {
                        longestLine = positions
                    }
                })

                lineString = createLineString(longestLine)
            }

            simplify(lineString, {
                highQuality: true,
                tolerance: 0.00007,
                mutate: true
            })

            const properties = geoJson.properties

            if(!("name" in properties!) || !properties["name"]) {
                console.error(`${JSON.stringify(properties)} is undefined, it might be missing from the route map`)
            }
            
            lineString.properties = properties

            return lineString
        })
        .filter(geoJson => geoJson !== null)
    
    if(options.returnGeoJson) {
        return createFeatureCollection(trainLines)
    }

    return trainLines.map(geoJson => ({
        name: geoJson.properties!["name"],
        coordinates: geoJson.geometry.coordinates,
        color: trainLineColorMap[geoJson.properties!["name"] as TrainLineName]
    }))

}

export default deriveTrainLinesFromGeoJson