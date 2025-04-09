<script lang="ts">
    import type { MetroLines, Suburb, TrainLine } from "$lib/types";
    import { type DataDrivenPropertyValueSpecification } from "maplibre-gl"
    import Game from "../components/Game.svelte";
    import { FillLayer, MapLibre, GeoJSONSource, LineLayer } from "svelte-maplibre-gl";
    import suburbsJson from "../json/suburbs.json"
    import trainLinesJson from "../json/trainLines.json"

    import { gameState } from "$lib/gameState.svelte";
    import { getClosenessRating } from "$lib/guessManager";
    import { feature, featureCollection, geometry, lineString, lineStrings, multiLineString, type AllGeoJSON } from "@turf/turf";
    import { SvelteMap } from "svelte/reactivity";

    const trainLines = (trainLinesJson as unknown) as TrainLine[]
    const suburbs = (suburbsJson as unknown) as Suburb[]
    const targetSuburb = suburbs.at(69)!

    gameState.targetSuburb = targetSuburb

    const guesses = $derived(gameState.guesses.entries().toArray().map(([, {distanceToTarget, suburb}]) => {
        // longest type name ever ?
        const color: DataDrivenPropertyValueSpecification<string> = [
            "rgb", 
            50, 
            50, 
            getClosenessRating(distanceToTarget) * 255]

        const geoJson = feature(
            geometry("Polygon", suburb.coordinates),
            {
                name: suburb.name
            }
        )

        return {
            color,
            geoJson,
            suburb,
            distanceToTarget
        }
    }))

    interface MapTrainLine {color: string, geoJson: AllGeoJSON} 
    
    const trainLinesGeoJson = new SvelteMap<MetroLines,MapTrainLine>(trainLines.map(trainLine => {
        const name = trainLine.name as MetroLines

        if(trainLine.type === "LineString") {
            return [
                name, {
                    color: "gray",
                    geoJson: lineString(trainLine.coordinates)
                }
            ]
        }

        return [
            name, {
                color: "gray",
                geoJson: multiLineString(trainLine.coordinates)
            }
        ]
    }))

    gameState.on("guessAdded", (guess) => {
        guess.suburb.lines.some((line) => {
            if(line === "Williamstown") {
                line = "Frankston"
            }

            const relevantLine = trainLinesGeoJson.get(line)

            if(!relevantLine) {
                console.error("Unknown line, this shouldn't happen", line)
            }

            if(targetSuburb.lines.includes(line)) {
                trainLinesGeoJson.set(line, {
                    ...relevantLine!,
                    color: "green",
                })
            } else {
                trainLinesGeoJson.set(line, {
                    ...relevantLine!,
                    color: "red",
                })
            }
        })
    })

</script>

<MapLibre 
    class='w-screen h-[80vh]'
    style="https://tiles.openfreemap.org/styles/positron"
    center={[144.96370394518178, -37.80899353983027]}
    zoom={11}>

    {#each trainLinesGeoJson as [, {geoJson, color}]}
    
        <GeoJSONSource data={geoJson}>
            <LineLayer paint={{
                'line-color': color,
                'line-width': 4
            }}>

            </LineLayer>
        </GeoJSONSource>
    {/each}



    {#each guesses as {color, geoJson}}
        <GeoJSONSource data={geoJson}>
            <FillLayer paint={{
                'fill-color': color,
                'fill-opacity': .9,
                "fill-outline-color": "#000000",
            }}>
    
            </FillLayer>

        </GeoJSONSource>
    {/each}
</MapLibre>

<Game {suburbs} {targetSuburb} ></Game>