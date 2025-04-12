import type { MetroLines, TramLines } from "./types";

// list 

export const trainLineColorMap: Record<MetroLines, string> = {
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
} as const

const correctnessGradient = [
    "#cddad1", "#c5d9ca", "#bcd8c4", "#b4d8bd", "#abd7b7", "#a3d6b1", "#9ad5aa", "#91d4a4", "#89d39e",
    "#80d297", "#78d291", "#6fd18a", "#67d084", "#5ecf7e", "#55ce77", "#4dcd71", "#44cc6b", "#3ccc64",
    "#33cb5e", "#2bca57", "#22c951"
] as const

export const getCorrectnessColor = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value))
    const index = Math.floor(clamped * correctnessGradient.length);
    return correctnessGradient[Math.min(index, correctnessGradient.length - 1)];
}

export const tramLineColorMap: Record<TramLines, string> = {
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