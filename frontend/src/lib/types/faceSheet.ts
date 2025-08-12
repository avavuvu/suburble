export type AttributionDeed = "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0"

export const attribution: Record<AttributionDeed, string> = {
    "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0",
    "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0",
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0"
} as const

export type FactSheet = {
    name: string,
    housePrice?: string,
    population?: number,
    etymology?: {
        "language": string,
        "description": string
    },
    attribution?: {
        type: AttributionDeed,
        author: string
    },
    hasImage?: boolean
}