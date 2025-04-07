<script lang="ts">
    import { convertCoordinatesToGeoJsonLine } from "$lib/GeoJsonUtil";
    import type { Suburb } from "$lib/types";
    import MapLibreGl from "maplibre-gl"
    import { SvelteMap } from "svelte/reactivity";

    const { map, trainLines }: {
        map: MapLibreGl.Map
        trainLines: Suburb[]
    } = $props()

    

    map.on("load", () => {

        const geoJson = {
            "type": "FeatureCollection",
            "features": 
                trainLines.map(train => {
                    return convertCoordinatesToGeoJsonLine(
                        train.coordinates, 
                        {
                            name: train.name
                        })
                })
                .filter((train) => train !== null)
        }
    
        map.addSource('lines', {
            'type': 'geojson',
            'data': geoJson
        });
    
        map.addLayer({
            'id': 'lines',
            'type': 'line',
            'source': 'lines',
            'layout': {},
            'paint': {
                'line-color': 'blue',
                'line-width': 20
            }
        });

    })
    map.on('click', 'lines', (e) => {
        new MapLibreGl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features![0].properties.name)
            .addTo(map);
    });
    
</script>

<ul>
    {#each trainSegments as [name, lines]}
        <li>
            <span>
                {name}
            </span>
            {#each lines as line}
                <p>
                    {line}, 
                </p>
            {/each}
        </li>
    {/each}
</ul>