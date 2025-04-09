import { sineIn } from "svelte/easing"

export const getClosenessRating = (distanceToTarget: number, farExtent = 20) => {
    return sineIn(
        Math.max(
            0,
            (1 - (distanceToTarget / farExtent))
        )
    )
}