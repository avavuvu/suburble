<script lang="ts">
    import { type StyleSpecification } from "maplibre-gl";
    import {
        FillLayer,
        MapLibre,
        GeoJSONSource,
        LineLayer,
        Marker,
        AttributionControl,
    } from "svelte-maplibre-gl";
    import mapLibreStyleJson from "../style/maplibre_style.json";
    import gameManager from "@lib/gameManager.svelte.ts";

    let {
        mapLoaded,
    }: {
        mapLoaded: () => void;
    } = $props();

    const mapLibreStyle = mapLibreStyleJson as unknown as StyleSpecification;

    // svelte-ignore non_reactive_update
    let map: maplibregl.Map | undefined = $state(undefined);

    $effect(() => {
        (map as maplibregl.Map).on("load", () => mapLoaded());

        gameManager.mapManager.map = map;
        map!.touchZoomRotate.disableRotation();
    });

    const trainLinesOnMapSorted = $derived(
        [...gameManager.mapManager.trainLinesOnMap].sort(
            ([, lineA], [, lineB]) => {
                let sortOrder = 0;
                if (lineA.color !== null && lineB.color === null) {
                    sortOrder = 1;
                }
                if (lineA.color === "green") {
                    sortOrder = 1;
                }

                return sortOrder;
            },
        ),
    );
</script>

<MapLibre
    class="w-full h-full"
    dragRotate={false}
    keyboard={false}
    boxZoom={true}
    pitchWithRotate={false}
    attributionControl={false}
    bind:map
    style={mapLibreStyle}
    center={[144.96370394518178, -37.80899353983027]}
    zoom={11}
>
    <AttributionControl position={"top-left"} compact />

    {#each trainLinesOnMapSorted as [name, { geoJson, color }]}
        <GeoJSONSource data={geoJson}>
            <LineLayer
                paint={{
                    "line-color": color || "transparent",
                    "line-width": 4,
                    "line-opacity": color === null ? 0 : 1,
                }}
            ></LineLayer>
        </GeoJSONSource>
    {/each}

    {#each gameManager.mapManager.suburbsOnMap as [, { suburb, emoji, geoJson, color }]}
        <GeoJSONSource data={geoJson}>
            <FillLayer
                paint={{
                    "fill-color": color,
                    "fill-opacity": 1,
                    "fill-outline-color": "#000000",
                }}
            ></FillLayer>

            <Marker lnglat={[suburb.centroid[0], suburb.centroid[1]]}>
                {#snippet content()}
                    <div class="flex justify-center flex-col items-center">
                        <div
                            class="w-min text-3xl rotate-0"
                            style:transform={`rotate(${emoji.direction + (emoji.offset || 0)}deg)`}
                        >
                            {emoji.emoji}
                        </div>
                        <div class="text-gray-700">
                            {suburb.name}
                        </div>
                    </div>
                {/snippet}
            </Marker>
        </GeoJSONSource>
    {/each}
</MapLibre>
