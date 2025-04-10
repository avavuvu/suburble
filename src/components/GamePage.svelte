<script lang="ts">
    import type { MetroLines, Suburb, TrainLine } from "$lib/types";
    import { type DataDrivenPropertyValueSpecification, type StyleSpecification } from "maplibre-gl"
    import Game from "./Game.svelte";
    import { FillLayer, MapLibre, GeoJSONSource, LineLayer, Marker } from "svelte-maplibre-gl";
    import suburbsJson from "../json/suburbs.json"
    import trainLinesJson from "../json/trainLines.json"
    import { gameState } from "$lib/gameState.svelte";
    import { getClosenessRating } from "$lib/guessManager";
    import { feature, geometry, lineString, multiLineString, type AllGeoJSON } from "@turf/turf";
    import { SvelteMap } from "svelte/reactivity";
    import mapLibreStyleJson from "../style/maplibre_style.json"
    import { getCorrectnessColor } from "$lib/consts";

    const { targetSuburb }: { targetSuburb: Suburb } = $props()

    const mapLibreStyle = (mapLibreStyleJson as unknown) as StyleSpecification

    const trainLines = (trainLinesJson as unknown) as TrainLine[]
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

    interface MapTrainLine {
        color: string, 
        geoJson: AllGeoJSON,
        isCorrect: boolean,
        wasGuessed: boolean
    }

    
    const trainLinesDisplay = new SvelteMap<MetroLines,MapTrainLine>(trainLines.map(trainLine => {
        const name = trainLine.name as MetroLines
        const geoJson = trainLine.type === "LineString"
            ? lineString(trainLine.coordinates)
            : multiLineString(trainLine.coordinates)

        return [
            name, 
            {
                geoJson,
                color: "gray",
                isCorrect: false,
                wasGuessed: false
            }
        ]
    }))

    const trainLineDisplaySorted = $derived(trainLinesDisplay.entries().toArray().toSorted(([,lineA], [,lineB]) => {
        let sortOrder = 0
        if(lineA.wasGuessed && !lineB.wasGuessed) { sortOrder = 1 }
        if(lineA.isCorrect) { sortOrder = 1 }
        
        return sortOrder
    }))

    // svelte-ignore non_reactive_update
    let map: maplibregl.Map | undefined = $state(undefined)

    gameState.on("guessAdded", (guess) => {
        map!.flyTo({
            center: [guess.suburb.centroid[1], guess.suburb.centroid[0]],
            speed: .6
        })


        guess.suburb.lines.some((line) => {
            if(line === "Williamstown") {
                line = "Frankston"
            }

            const relevantLine = trainLinesDisplay.get(line)

            if(!relevantLine) {
                console.error("Unknown line, this shouldn't happen", line)
            }

            if(targetSuburb.lines.includes(line)) {
                trainLinesDisplay.set(line, {
                    ...relevantLine!,
                    color: "green",
                    wasGuessed: true,
                    isCorrect: true
                })
            } else {
                trainLinesDisplay.set(line, {
                    ...relevantLine!,
                    color: "gray",
                    wasGuessed: true,
                    isCorrect: false
                })
            }
        })
    })



</script>

<MapLibre 
    bind:map
    class='w-screen h-screen absolute'
    style={mapLibreStyle}
    center={[144.96370394518178, -37.80899353983027]}
    zoom={11}>

    {#each trainLineDisplaySorted as [, {geoJson, color}]}
        <GeoJSONSource data={geoJson}>
            <LineLayer paint={{
                'line-color': color,
                'line-width': 4
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

<div class="fixed bottom-16 w-full flex justify-center">
    <div class="bg-white w-[90vw] rounded-2xl p-4">
        <Game {suburbs} {targetSuburb} ></Game>

    </div>

</div>