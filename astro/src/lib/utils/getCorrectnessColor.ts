import { sineIn } from "svelte/easing"

const correctnessGradient = [
    "#cddad1", "#c5d9ca", "#bcd8c4", "#b4d8bd", "#abd7b7", "#a3d6b1", "#9ad5aa", "#91d4a4", "#89d39e",
    "#80d297", "#78d291", "#6fd18a", "#67d084", "#5ecf7e", "#55ce77", "#4dcd71", "#44cc6b", "#3ccc64",
    "#33cb5e", "#2bca57", "#22c951"
] as const

export const getClosenessRating = (distanceToTarget: number, farExtent = 20) => {
    return sineIn(
        Math.max(
            0,
            (1 - (distanceToTarget / farExtent))
        )
    )
}


export const getCorrectnessColor = (value: number) => {
    const clamped = Math.max(0, Math.min(1, getClosenessRating(value)))
    const index = Math.floor(clamped * correctnessGradient.length);
    return correctnessGradient[Math.min(index, correctnessGradient.length - 1)];
}
