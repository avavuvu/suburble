<script lang="ts">
    import type { Suburb } from "$lib/types";
    import MapLibreGl from "maplibre-gl"
    import { onMount } from "svelte";
    import type { EventHandler } from "svelte/elements";
    import Game from "../components/Game.svelte";

    const beginMap = async () => {
        const response = await fetch("/parsed_suburbs.json")
        const suburbs: Suburb[] = await response.json()

        const targetSuburb = suburbs.at(23)!
        
        return {suburbs, targetSuburb}
    }

    let map: MapLibreGl.Map

    onMount(() => {
        map = new MapLibreGl.Map({
            container: 'map', 
            style: 'https://tiles.openfreemap.org/styles/positron',
            center: [144.96370394518178, -37.80899353983027],
            zoom: 11
        });
    })

    
</script>

<main>

    <div id="map">
    
    </div>

    {#await beginMap()}
        <!--  -->
    {:then {suburbs, targetSuburb}} 
        <Game {suburbs} {map} {targetSuburb} />
        
    {/await}
</main>


<style>
    #map {
        width: 100vw;
        height: 50vh;
    }
</style>