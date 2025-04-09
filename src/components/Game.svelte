<script lang="ts">
    import type { Suburb, Coordinates } from "$lib/types";
    import type { EventHandler } from "svelte/elements";
    import MapLibreGl from "maplibre-gl"
    import { convertCoordinatesToGeoJsonPolygon } from "$lib/GeoJsonUtil";
    import { SvelteMap } from "svelte/reactivity";
    import distance from "@turf/distance";
    import { sineIn } from "svelte/easing";
    import { gameState } from "$lib/gameState.svelte";

    const { suburbs, targetSuburb }: { suburbs: Suburb[], targetSuburb: Suburb } = $props()

    const suburbMap = new Map<string, Suburb>(
        suburbs.map((suburb) => {
            return [
                suburb.name.toLowerCase(),
                suburb
            ]
        })
    )

    let inputValue = $state("")
    
    const submit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault(); 
        
        const formData = new FormData(event.currentTarget)
        const suburbName = formData.get("suburb")

        const suburb = suburbMap.get(String(suburbName).toLowerCase()) ?? null

        inputValue = ""
        const successfulGuess = attemptGuess(suburb)        
    }

    const attemptGuess = (suburb: Suburb | null): boolean => {
        // guess invalid
        if(suburb === null) {
            return false
        }

        const previouslyGuessed = gameState.guesses.has(suburb.name.toLowerCase())
        if(previouslyGuessed) {
            return false
        }

        // guess valid

        const distanceToTarget = distance(
            targetSuburb.centroid, 
            suburb.centroid,
            { units: "kilometres"}
        )

        const newGues = {
            suburb,
            distanceToTarget
        }

        gameState.guesses.set(suburb.name.toLowerCase(), newGues)
        gameState.emitter.emit('guessAdded', newGues)

        flyToPoint([suburb.centroid[1], suburb.centroid[0]])
        

        return true
    }

    const flyToPoint = (coord: Coordinates) => {
        // map.flyTo({
        //     center: coord,
        //     speed: .6
        // })
    }


</script>

<form onsubmit={submit}>
    <input 
        autocomplete="off"
        bind:value={inputValue}
        class="border-2 border-black"
        list="suburbs" name="suburb" id="suburb">

    <datalist id="suburbs">
        {#each suburbs as suburb}
            <!-- svelte-ignore node_invalid_placement_ssr -->
            <option value={suburb.name}></option>
        {/each}
    </datalist>
    <input type="submit">
</form>

<div>
    <ul>
        {#each gameState.guesses.entries().toArray().reverse() as [_, guess]}
            <li>
                {guess.suburb.name} – {guess.distanceToTarget.toFixed(2)}km 

                <p>
                    correct line: {guess.suburb.lines.some((line) => targetSuburb.lines.includes(line))}
                </p>
            </li>

        {/each}
        
    </ul>
</div>


<style></style>