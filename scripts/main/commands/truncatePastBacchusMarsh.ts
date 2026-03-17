import type { TrainLine } from "suburble-shared"

/**
 * Bacchus Marsh coordinates (lng, lat).
 * 37°40′30″S 144°26′20″E → [-37.675, 144.4389]
 */
const BACCHUS_MARSH_LNG = 144.4389

/**
 * Truncates train line coordinates that extend west of Bacchus Marsh.
 * 
 * The train line data from OSM keeps going all the way to ballarat
 */
function truncatePastBacchusMarsh(trainLine: TrainLine): TrainLine {
    const truncatedCoords = []

    for (const coord of trainLine.coordinates) {
        const lng = coord[0]

        if (lng < BACCHUS_MARSH_LNG) {
            break
        }

        truncatedCoords.push(coord)
    }

    // If no coordinates were kept (line is entirely west of Bacchus Marsh),
    // return the original to avoid empty lines
    if (truncatedCoords.length < 2) {
        console.error("No data provided")
    }

    return {
        ...trainLine,
        coordinates: truncatedCoords
    }
}

export default truncatePastBacchusMarsh
