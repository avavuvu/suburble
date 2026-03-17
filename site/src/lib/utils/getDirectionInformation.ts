import type { Cardinal } from "../types/geoJson"
import bearing from "@turf/bearing"
import distance from "@turf/distance"
import type { Position } from "geojson"

export type DirectionInfo = {
    cardinalToTarget: Cardinal,
    directionToTarget: number,
    distanceToTarget: number,
    emojiDirection: {
        offset: number,
        emoji: string
    }
}

function getDirectionInformation(start: Position, target: Position): DirectionInfo {

    const distanceToTarget = distance(
        start,
        target,
        { units: "kilometres" }
    )

    const bearingToTarget = bearing(
        start,
        target,
    )

    const directionToTarget = Math.round((bearingToTarget) / 45) * 45

    const cardinalToTarget: Cardinal = {
        0: "North",
        "-0": "North",
        45: "North-East",
        90: "East",
        135: "South-East",
        180: "South",
        225: "South-West",
        270: "West",
        315: "North-West",
        "-45": "North-West",
        "-90": "West",
        "-135": "North-West",
        "-180": "North",
    }[directionToTarget]! as Cardinal

    let emojiDirection = {
        "North": {
            emoji: "☝️",
            offset: 0,
        },
        "South-West": {
            emoji: "👇",
            offset: 180,
        },
        "South-East": {
            emoji: "👇",
            offset: 180,
        },
        "South": {
            emoji: "👇",
            offset: 180,
        },
        "North-East": {
            emoji: "👉",
            offset: -90,
        },
        "East": {
            emoji: "👉",
            offset: -90,
        },
        "West": {
            emoji: "👈",
            offset: 90,
        },
        "North-West": {
            emoji: "👈",
            offset: 90,
        },
    }[cardinalToTarget]

    if (!cardinalToTarget) {
        throw new Error(`Invalid direction: ${directionToTarget}`);
    }

    return {
        cardinalToTarget,
        directionToTarget,
        distanceToTarget,
        emojiDirection
    }
}

export default getDirectionInformation
