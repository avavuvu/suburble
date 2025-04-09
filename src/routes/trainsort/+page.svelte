<script lang="ts">
    import { onMount } from "svelte";
    import MapLibreGl from "maplibre-gl"
    import { FillLayer, GeoJSONSource, LineLayer, MapLibre, Marker, Popup } from "svelte-maplibre-gl";
    import type { Suburb } from "$lib/types";
    import { convertCoordinatesToGeoJsonLine } from "$lib/GeoJsonUtil";
    import TrainSort from "../../components/TrainSort.svelte";
    import { SvelteMap } from "svelte/reactivity";
    import trainSegments from "../../geojson/parsed_train_lines.json"

    let popupLngLat: MapLibreGl.LngLatLike = $state([144.96370394518178, -37.80899353983027])



    const trainLineMap = new SvelteMap<string, TrainLine[]>(
        trainSegments.map(({name}) => [name, []])
    )

    const geoJson = {
        "type": "FeatureCollection",
        "features": 
            (trainSegments as Suburb[]).map(train => {
                return convertCoordinatesToGeoJsonLine(
                    train.coordinates, 
                    {
                        name: train.name
                    })
            })
            .filter((train) => train !== null)
    }

    let currentSegment = $state("")

    let currentOption = $state("")

    const select = () => {
        trainLineMap.set(currentSegment, 
            trainLineMap.get(currentSegment)!.concat(currentOption as TrainLine)
        )
    }
    
    const exportAsJson = () => {
        const segments = trainLineMap.entries().toArray()
            .filter(([, lines]) => {
                return lines.length > 0
            })
            .map(([segment, lines]) => ({
                segment,
                lines
            }))

        const jsonDataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(segments));
        window.open(jsonDataUri, '_blank');
    }

</script>

<MapLibre 
    class='w-screen h-[80vh]'
    style="https://tiles.openfreemap.org/styles/positron"
    center={[144.96370394518178, -37.80899353983027]}
    zoom={11}>

    <GeoJSONSource data={geoJson}>
        <LineLayer 
            onclick={(e) => {
                console.log("test")
                popupLngLat = e.lngLat
                currentSegment = e.features![0].properties.name
            }}
            paint={{
            'line-color': 'blue',
            'line-width': 20
        }}>
        </LineLayer>
    </GeoJSONSource>


    <Marker bind:lnglat={popupLngLat}>
        <Popup class="w-[300px]">
            <div class="text-center leading-none bg-white w-full">
                <p class="font-bold">{currentSegment}</p>
                <select bind:value={currentOption}>
                    {#each trainLines as line}
                        <option value={line}>{line}</option>
                    {/each}
                </select>
                <button onclick={select} class="border border-black">add</button>
                <ul>
                    {#each trainLineMap.get(currentSegment) ?? [] as line}
                        <li>{line}</li>
                    {/each}
                </ul>
            </div>
        </Popup>
    </Marker>

</MapLibre>

<div>
    <button onclick={exportAsJson}>
        export as json
    </button>
</div>