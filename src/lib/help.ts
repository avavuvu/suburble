import type { Cardinal, PTVLineName, PTVLineOverlap, Suburb } from "./types"

const oppositeCardinal = (cardinal: Cardinal): Cardinal => {
    return {
        "North": "South",
        "South": "North",
        "East": "West",
        "West": "East",
    }[cardinal] as Cardinal
}

type DistanceHelp = {
    type: "Distance",
    distanceToTarget: number,
    cardinal: Cardinal,
    suburb: Suburb,
}

type LineHelp = {
    type: "Line",
    overlap: PTVLineOverlap,
    suburb: Suburb,
}

type LivesHelp = {
    type: "Lives",
    lives: number
}

export type Help = LineHelp | DistanceHelp | LivesHelp

export const generateHelpText = (help: Help) => {

    if(help.type === "Distance") {
        return `${help.suburb.name} is ${help.distanceToTarget.toFixed(0)}km ${oppositeCardinal(help.cardinal).toLowerCase()} of our target`
    }else if (help.type === "Line") {
        if(help.overlap.type === "none") {
            return `${help.suburb.name} does not share any train or tram lines with our target`
        }

        if(help.overlap.type === "some") {
            const lines = `${help.overlap.lines.slice(0,-1).join(", ")} and ${help.overlap.lines.at(-1)}`

            if(help.overlap.lines.length > 2) {
                return `Our target could be on any of these ${help.overlap.lines.length} lines: ${lines}`
            }

            return `Our target could be on any of these lines: ${lines}`
        }

        if(help.overlap.type === "every") {
            if(help.overlap.lines.length === 1) {
                return `Our target is on the ${help.overlap.lines[0]}`
            }

            const lines = `${help.overlap.lines.slice(0,-1).join(", ")} and ${help.overlap.lines.at(-1)}`
            return `Our target is on these lines: ${lines}`
        }
    } else if(help.type === "Lives") {
        return `You have ${help.lives} guesses left!`
    }


    return ""
}