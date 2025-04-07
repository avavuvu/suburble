<script lang="ts">
    import type { Suburb, Coordinates } from "$lib/types";
    import type { EventHandler } from "svelte/elements";
    import MapLibreGl from "maplibre-gl"
    import { convertCoordinatesToGeoJsonPolygon } from "$lib/GeoJsonUtil";
    import { SvelteMap } from "svelte/reactivity";
    import distance from "@turf/distance";
    import { sineIn } from "svelte/easing";

    const { suburbs, map, targetSuburb }: { suburbs: Suburb[], map: MapLibreGl.Map, targetSuburb: Suburb } = $props()

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

    const getClosenessRating = (distanceToTarget: number, farExtent = 20) => {
        return sineIn(
            Math.max(
                0,
                (1 - (distanceToTarget / farExtent))
            )
        )
    }
    
    type Guess = {
        suburb: Suburb,
        distanceToTarget: number
    }
    const guesses = new SvelteMap<string, Guess>()
    
    const attemptGuess = (suburb: Suburb | null): boolean => {
        if(suburb === null) {
            return false
        }

        const previouslyGuessed = guesses.has(suburb.name.toLowerCase())
        if(previouslyGuessed) {
            return false
        }

        const distanceToTarget = distance(
            targetSuburb.centroid, 
            suburb.centroid,
            { units: "kilometres"}
        )

        guesses.set(suburb.name.toLowerCase(), {
            suburb,
            distanceToTarget
        })

        flyToPoint([suburb.centroid[1], suburb.centroid[0]])
        
        addSuburbToMap(suburb, distanceToTarget)

        return true
    }

    const flyToPoint = (coord: Coordinates) => {
        map.flyTo({
            center: coord,
            speed: .6
        })
    }

    const addSuburbToMap = (suburb: Suburb, distanceToTarget: number) => {
        const geoJson = {
            "type": "FeatureCollection",
            "features": 
                [convertCoordinatesToGeoJsonPolygon(
                    suburb.coordinates,
                    { name: suburb.name }
                )]
        }

        map.addSource(suburb.name, {
            'type': 'geojson',
            'data': geoJson
        });

        const closenessColorChannel = getClosenessRating(distanceToTarget) * 255

        map.addLayer({
            'id': suburb.name,
            'type': 'fill',
            'source': suburb.name,
            'layout': {},
            'paint': {
                'fill-color': ["rgb", 50, 50, closenessColorChannel],
                'fill-opacity': .9,
                "fill-outline-color": "#000000",
            }
        });
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
        {#each guesses as [_, guess]}
            <li>
                {guess.suburb.name} – {guess.distanceToTarget.toFixed(2)}km 
            </li>
        {/each}
        
    </ul>
</div>


<style></style>