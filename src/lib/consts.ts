import type { MetroLines } from "./types";

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