export type AttributionDeed = "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0"

export const attribution: Record<AttributionDeed, string> = {
    "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0",
    "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0",
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0"
} as const

export const imageAttribution: { [name: string]: { author: string, type: AttributionDeed } } = {
    "campbellfield": {
        "author": "Andrew Owens",
        "type": "CC BY-SA 4.0"
    },
    "cranbourne": {
        "author": "John O'Neill",
        "type": "CC BY-SA 3.0"
    },
    "kooyong": {
        "author": "Brycewhite",
        "type": "CC BY-SA 4.0"
    },
    "hampton east": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "highett": {
        "author": "Celco85",
        "type": "CC BY-SA 4.0"
    },
    "point cook": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "reservoir": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "north melbourne": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "moorabbin airport": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "box hill north": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "oak park": {
        "author": "Sgroey",
        "type": "CC BY-SA 4.0"
    },
    "chelsea": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    },
    "lalor": {
        "author": "Philip Mallis",
        "type": "CC BY-SA 2.0"
    }
};