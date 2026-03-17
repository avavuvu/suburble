import type { TrainLineName } from "../types/trainLine"

export const trainLineColorMap: Record<TrainLineName, string> = {
    "Alamein": "#152C6B",
    "Belgrave": "#152C6B",
    "Lilydale": "#152C6B",
    "Glen Waverley": "#152C6B",

    "Sandringham": "#F178AF",
    "Williamstown": "#F178AF",
    "Werribee": "#F178AF",
    "Altona Loop": "#F178AF",

    "Frankston": "#028430",

    "Cranbourne": "#279FD5",
    "East Pakenham": "#279FD5",
    "Sunbury": "#279FD5",

    "Upfield": "#FFBE00",
    "Craigieburn": "#FFBE00",

    "Mernda": "#BE1014",
    "Hurstbridge": "#BE1014",

    "Geelong": "#8F1A95",
    "Ballarat": "#8F1A95",
} as const
