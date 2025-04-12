<script lang="ts">
    import type { MetroLines, Suburb, PTVLine, TramLines } from "$lib/types";
    import { type DataDrivenPropertyValueSpecification, type StyleSpecification } from "maplibre-gl"
    import Game from "./Game.svelte";
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

    const { targetSuburb }: { targetSuburb: Suburb } = $props()

    const mapLibreStyle = (mapLibreStyleJson as unknown) as StyleSpecification

    const tramLines = (tramLinesJson as unknown) as PTVLine[]
    const trainLines = (trainLinesJson as unknown) as PTVLine[]
    const suburbs = (suburbsJson as unknown) as Suburb[]

    gameState.targetSuburb = targetSuburb

    const guessesDisplay = $derived(gameState.guesses.entries().toArray().map(([, guess]) => {
        // longest type name ever ?
        const color = getCorrectnessColor(getClosenessRating(guess.distanceToTarget))

        const suburbBoundaryColor: string = color

        const geoJson = feature(
            geometry("Polygon", guess.suburb.coordinates),
            {
                name: guess.suburb.name
            }
        )

        return {
            color: suburbBoundaryColor,
            geoJson,
            ...guess
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

    const trainLineDisplaySorted = $derived(PTVLinesDisplay.entries().toArray().toSorted(([,lineA], [,lineB]) => {
        let sortOrder = 0
        if(lineA.wasGuessed && !lineB.wasGuessed) { sortOrder = 1 }
        if(lineA.isCorrect) { sortOrder = 1 }
        
        return sortOrder
    }))

    // svelte-ignore non_reactive_update
    let map: maplibregl.Map | undefined = $state(undefined)

    const guessAdded = (guess: Guess) => {
        map!.flyTo({
            center: [guess.suburb.centroid[1], guess.suburb.centroid[0]],
            speed: .6
        })

        const linesA = guess.suburb.lines.map(line => line === "Williamstown" ? "Frankston" : line)
        const linesB = targetSuburb.lines.map(line => line === "Williamstown" ? "Frankston" : line)

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
    gameState.on("gameEnded", (guess) => {
        if(guess) {
            guessAdded(guess)
        }
    })
</script>

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

    {#each guessesDisplay as {color, geoJson, directionToTarget, suburb, emojiDirection}}
        <GeoJSONSource data={geoJson}>
            <FillLayer paint={{
                'fill-color': color,
                'fill-opacity': 1,
                "fill-outline-color": "#000000",
            }}>
    
            </FillLayer>
            
            <Marker lnglat={[suburb.centroid[1],suburb.centroid[0]]}>
                {#snippet content()}
                    <div class="w-min text-3xl">
                        {emojiDirection}
                    </div>
                {/snippet}
            </Marker>

        </GeoJSONSource>
    {/each}
</MapLibre>

<div class="fixed bottom-12 w-full flex justify-center">
    <div class="bg-white w-[90vw] rounded-2xl p-2">
        <Game {suburbs} {targetSuburb} ></Game>

    </div>

</div>