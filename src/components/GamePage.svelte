<script lang="ts">
    import type { MetroLines, Suburb, PTVLine, TramLines } from "$lib/types";
    import { type DataDrivenPropertyValueSpecification, type StyleSpecification } from "maplibre-gl"
    import Form from "./Form.svelte";
    import { FillLayer, MapLibre, GeoJSONSource, LineLayer, Marker } from "svelte-maplibre-gl";
    import suburbsJson from "../json/suburbs.json"
    import trainLinesJson from "../json/trainLines.json"
    import tramLinesJson from "../json/tramLines.json"

    import { gameState, type Guess } from "$lib/gameState.svelte";
    import { getClosenessRating } from "$lib/guessManager";
    import { feature, geometry, lineString, multiLineString, type AllGeoJSON } from "@turf/turf";
    import { SvelteMap } from "svelte/reactivity";
    import mapLibreStyleJson from "../style/maplibre_style.json"
    import { getCorrectnessColor } from "$lib/consts";



    const mapLibreStyle = (mapLibreStyleJson as unknown) as StyleSpecification

    const tramLines = (tramLinesJson as unknown) as PTVLine[]
    const trainLines = (trainLinesJson as unknown) as PTVLine[]

    const guessesDisplay = $derived([...gameState.guesses].map(([, guess]) => {
        
        let emoji = ""
        let color = ""

        if(guess.type === "guess") {
            color = getCorrectnessColor(getClosenessRating(guess.distanceToTarget))
            emoji = guess.emojiDirection
        } else {
            color = getCorrectnessColor(1)
            emoji = "⭐️"
        }

        const geoJson = feature(
            geometry("Polygon", guess.suburb.coordinates),
            {
                name: guess.suburb.name
            }
        )

        return {
            color,
            geoJson,
            suburb: guess.suburb,
            emoji
        }
    }))

    interface MapPTVLine {
        color: string, 
        geoJson: AllGeoJSON,
        isCorrect: boolean,
        wasGuessed: boolean,
        type: "tram" | "train"
    }

    const PTVLinesDisplay = new SvelteMap<MetroLines | TramLines,MapPTVLine>(trainLines.concat(tramLines).map(line => {
        const name = line.name as MetroLines | TramLines

        const type = name.toLowerCase().includes("route")
            ? "tram"
            : "train"

        const geoJson = line.type === "LineString"
            ? lineString(line.coordinates)
            : multiLineString(line.coordinates)

        return [
            name, 
            {
                geoJson,
                color: "gray",
                isCorrect: false,
                wasGuessed: false,
                type
            }
        ]
    }))

    const trainLineDisplaySorted = $derived([...PTVLinesDisplay].toSorted(([,lineA], [,lineB]) => {
        let sortOrder = 0
        if(lineA.wasGuessed && !lineB.wasGuessed) { sortOrder = 1 }
        if(lineA.isCorrect) { sortOrder = 1 }
        
        return sortOrder
    }))

    // svelte-ignore non_reactive_update
    let map: maplibregl.Map | undefined = $state(undefined)

    const flyToSuburb = (suburb: Suburb) => {
        map!.flyTo({
            center: [suburb.centroid[1], suburb.centroid[0]],
            speed: .6,
            offset: [0, -150],
            zoom: 12
        })
    }

    const guessAdded = (guess: Guess) => {
        flyToSuburb(guess.suburb)

        const linesA = guess.suburb.lines.map(line => line === "Williamstown" ? "Frankston" : line)
        const linesB = gameState.targetSuburb.lines.map(line => line === "Williamstown" ? "Frankston" : line)

        const doSuburbLinesCompletelyOverlap = linesA.length === linesB.length 
            && linesA.every(value => linesB.includes(value))

        const doSuburbsOverlap = linesA.some(line => linesB.includes(line))

        guess.suburb.lines.forEach(line => {
            const relevantLine = PTVLinesDisplay.get(line)

            if(relevantLine?.isCorrect) {
                return
            }

            if(doSuburbLinesCompletelyOverlap) {
                PTVLinesDisplay.set(line, {
                    ...relevantLine!,
                    color: "green",
                    wasGuessed: true,
                    isCorrect: true
                })

                return
            }

            if(doSuburbsOverlap) {
                PTVLinesDisplay.set(line, {
                    ...relevantLine!,
                    color: "orange",
                    wasGuessed: true,
                    isCorrect: false
                })

                return
            }

            PTVLinesDisplay.set(line, {
                ...relevantLine!,
                color: "gray",
                wasGuessed: true,
                isCorrect: false
            })
        })
    }
        
    gameState.on("guessAdded", guessAdded)
    gameState.on("gameEnded", (finalEntry) => {
        flyToSuburb(finalEntry.suburb)
    })
</script>

<main>
    <div>
        <MapLibre 
            bind:map
            class='w-screen h-screen absolute'
            style={mapLibreStyle}
            center={[144.96370394518178, -37.80899353983027]}
            zoom={11}>
        
            {#each trainLineDisplaySorted as [, {geoJson, color, wasGuessed, type}]}
                <GeoJSONSource data={geoJson}>
                    <LineLayer paint={{
                        'line-color': color,
                        'line-width': type === "tram" ? 2 : 5,
                        'line-opacity': wasGuessed ? 1 : 0
                    }}>
                    </LineLayer>
                </GeoJSONSource>
            {/each}
        
            {#each guessesDisplay as guess}
                <GeoJSONSource data={guess.geoJson}>
                    <FillLayer paint={{
                        'fill-color': guess.color,
                        'fill-opacity': 1,
                        "fill-outline-color": "#000000",
                    }}>
            
                    </FillLayer>
                    
                    <Marker lnglat={[guess.suburb.centroid[1],guess.suburb.centroid[0]]}>
                        {#snippet content()}
                            <div class="w-min text-3xl">
                                {guess.emoji}
                            </div>
                        {/snippet}
                    </Marker>
        
                </GeoJSONSource>
            {/each}
        </MapLibre>
        
        
    </div>

    <Form></Form>
</main>



<style>

</style>