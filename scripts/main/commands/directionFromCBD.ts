import type { Suburb } from "../types/suburbTypes"
import CBDCenter from "../consts/CBDcenter"
import { bearing as getBering } from "@turf/turf"
import type { Cardinal } from "../types/directionTypes"



function directionFromCBD (suburbs: Suburb[]) {
    return suburbs
        .map((suburb) => {
            if(suburb.name === "Melbourne") {
                // exit early because this doesnt make sense
                return suburb
            }

            const bearing = getBering(CBDCenter, suburb.centroid)

            const directionToTarget = Math.round((bearing) / 45) * 45

            const cardinalToTarget: Cardinal = {
                0:      "North",
                "-0":   "North",
                45:     "North-East",
                90:     "East",
                135:    "South-East",
                180:    "South",
                225:    "South-West",
                270:    "West",
                315:    "North-West",
                "-45":  "North-West",
                "-90":  "West",
            }[directionToTarget]! as Cardinal

            return {
                ...suburb,
                directionFromCBD: cardinalToTarget
            }
        }
    )
}

export default directionFromCBD