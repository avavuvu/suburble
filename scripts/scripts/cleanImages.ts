/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import {
    initializeImageMagick,
    ImageMagick,
    Magick,
    MagickFormat,
    Quantum,
} from '@imagemagick/magick-wasm';



// Remove '../' and use '@imagemagick/magick-wasm' when using this in your project.
const wasmLocation = './node_modules/@imagemagick/magick-wasm/dist/magick.wasm';
const wasmBytes = readFileSync(wasmLocation);
initializeImageMagick(wasmBytes).then(async () => {
    const imageDirectories = await readdir("./downloads/")

    for(const dir of imageDirectories) {
        const directory = dir.toLowerCase()

        
        if(dir.startsWith(".")) {
            continue
        }
        const files = await readdir(`./downloads/${directory}/`)
        const path = files.find(file => 
            file.toLowerCase().endsWith(".jpg") 
            || file.toLowerCase().endsWith(".png") 
            || file.toLowerCase().endsWith(".jpeg"))!
        console.log(`./downloads/${directory}/${path}`)


        

        const file = readFileSync(`./downloads/${directory}/${path}`)

        ImageMagick.read(file, (image) => {
            if(image.width > 1080) {
                image.resize(1080, 0)

            }
            
            image.quality = 50
            
            image.write(MagickFormat.WebP, async data => {
                await Bun.write(`./output/images/suburbs/${directory}/${directory}.webp`, data)
            })

            image.write(MagickFormat.Avif, async data => {
                await Bun.write(`./output/images/suburbs/${directory}/${directory}.avif`, data)
            })
        })
    }

    
});