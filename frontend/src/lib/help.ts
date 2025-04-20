import type { Cardinal, PTVLineName, PTVLineOverlap, Suburb } from "./types"

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

type ErrorHelp = {
    type: "Error",
    errorType: "Already Guessed" | "Not a Suburb",
    suburbName: string
}

export type Help = LineHelp | DistanceHelp | LivesHelp | ErrorHelp

export const generateHelpText = (help: Help) => {
    if(help.type === "Distance") {
        return `Our target is ${help.distanceToTarget.toFixed(0)}km ${help.cardinal.toLowerCase()} of ${help.suburb.name} `
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
    } else if(help.type === "Error") {
        if(help.errorType === "Already Guessed") {
            return `${help.suburbName} has already been gussed!`
        }else {
            return `"${help.suburbName}" is not in the Suburb list.`
        }
    }


    return ""
}