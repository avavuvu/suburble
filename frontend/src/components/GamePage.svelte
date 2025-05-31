<script lang="ts">
    import { type MetroLines, type Suburb, type PTVLine, type PTVLineName } from "$lib/types";
    import { type StyleSpecification } from "maplibre-gl"
    import Form from "./Form.svelte";
    import { FillLayer, MapLibre, GeoJSONSource, LineLayer, Marker, AttributionControl } from "svelte-maplibre-gl";
    import trainLinesJson from "../json/trainLines.json"

    import { gameState, type Guess } from "$lib/gameState.svelte";
    import { getClosenessRating } from "$lib/guessManager";
    import { feature, geometry, lineString, multiLineString, type AllGeoJSON } from "@turf/turf";
    import { SvelteMap } from "svelte/reactivity";
    import mapLibreStyleJson from "../style/maplibre_style.json"
    import { getCorrectnessColor } from "$lib/consts";



    const mapLibreStyle = (mapLibreStyleJson as unknown) as StyleSpecification

    const trainLines = (trainLinesJson as unknown) as PTVLine[]

    const guessesDisplay = $derived([...gameState.guesses].map(([, guess]) => {
        
        let emoji = ""
        let color = ""
        let direction = 0

        if(guess.type === "guess") {
            color = getCorrectnessColor(getClosenessRating(guess.distanceToTarget))
            emoji = guess.emoji
            direction = guess.directionToTarget
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
            emoji,
            direction,
        }
    }))

    interface MapPTVLine {
        color: string, 
        geoJson: AllGeoJSON,
        correctState: CorrectState,
    }

    const PTVLinesDisplay = new SvelteMap<MetroLines,MapPTVLine>(trainLines.map(line => {
        const name = line.name as MetroLines

        const geoJson = line.type === "LineString"
            ? lineString(line.coordinates)
            : multiLineString(line.coordinates)

        return [
            name, 
            {
                geoJson,
                color: "gray",
                correctState: "not guessed",
            }
        ]
    }))

    const trainLineDisplaySorted = $derived([...PTVLinesDisplay].toSorted(([,lineA], [,lineB]) => {
        let sortOrder = 0
        if(lineA.correctState !== "not guessed" && lineB.correctState === "not guessed") { sortOrder = 1 }
        if(lineA.correctState === "correct") { sortOrder = 1 }
        
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

    type CorrectState = "correct" | "incorrect" | "half correct" | "not guessed"

    const guessAdded = (guess: Guess) => {
        flyToSuburb(guess.suburb)

        const linesA = guess.suburb.lines.map(line => line === "Williamstown" ? "Frankston" : line)
        const linesB = gameState.targetSuburb.lines.map(line => line === "Williamstown" ? "Frankston" : line)

        const doSuburbLinesCompletelyOverlap = linesA.length === linesB.length 
            && linesA.every(value => linesB.includes(value))

        const doSuburbsOverlap = linesA.some(line => linesB.includes(line))

        guess.suburb.lines.forEach(line => {
            const lineDisplay = PTVLinesDisplay.get(line as PTVLineName)

            if(lineDisplay?.correctState === "correct") {
                return
            }

            if(doSuburbLinesCompletelyOverlap) {
                PTVLinesDisplay.set(line as PTVLineName, {
                    ...lineDisplay!,
                    color: "green",
                    correctState: "correct"
                })

                return
            }

            if(doSuburbsOverlap) {
                PTVLinesDisplay.set(line as PTVLineName, {
                    ...lineDisplay!,
                    color: "orange",
                    correctState: "half correct"
                })

                return
            }
            PTVLinesDisplay.set(line as PTVLineName, {
                ...lineDisplay!,
                color: "gray",
                correctState: "incorrect"
            })
        })
    }
        
    gameState.on("guessAdded", guessAdded)
    gameState.on("gameEnded", (finalEntry) => {
        flyToSuburb(finalEntry.suburb)

        finalEntry.suburb.lines.forEach(line => {
            const relevantLine = PTVLinesDisplay.get(line)

            PTVLinesDisplay.set(line, {
                ...relevantLine!,
                color: "green",
                correctState: "correct"
            })
        })
    })
</script>

<main>
    <div>
        <MapLibre 
            dragRotate={false}
            keyboard={false}
            touchZoomRotate={false}
            attributionControl={false}
            bind:map
            class='w-screen h-screen absolute'
            style={mapLibreStyle}
            center={[144.96370394518178, -37.80899353983027]}
            zoom={11}>

            <AttributionControl position={"top-left"} compact/>
            
            {#each trainLineDisplaySorted as [, {geoJson, color, correctState}]}
                <GeoJSONSource data={geoJson}>
                    <LineLayer paint={{
                        'line-color': color,
                        'line-width': 5,
                        'line-opacity': correctState !== "not guessed" ? 1 : 0
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
                            <div class="flex justify-center flex-col items-center">
                                <div class="w-min text-3xl rotate-0" style:transform={`rotate(${guess.direction}deg)`}>
                                    {guess.emoji}
                                </div>
                                <div class="text-gray-700">
                                    {guess.suburb.name}
                                </div>
                                

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