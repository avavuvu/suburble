import fs from "node:fs/promises"
import type { Suburb } from "../types/suburbTypes"

async function checkForImages(suburbs: Suburb[], options: {
    imageFolder: string
}) {
    const directory = await fs.readdir(options.imageFolder)
    suburbs.map(suburb => ({
        ...suburb,
        hasImage: directory.includes(suburb.name)
    }))

    const images: {[name: string]: {hasImage: boolean}} = {}

    for(const suburb of suburbs) {
        const hasImage = directory.includes(suburb.name);

        if(!hasImage) {
            continue
        }

        images[suburb.name.toLowerCase()] = {
            hasImage: true
        }
    }

    return images
}

export default checkForImages

// await checkForImages({ imageFolder: "./scripts/downloads"})