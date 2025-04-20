<script lang="ts">
    import type { CorrectSuburb } from "$lib/gameState.svelte";
    import { attribution, type Factsheet } from "$lib/types";
    import { fade } from "svelte/transition";
    import { UAParser } from "ua-parser-js";

    const { factSheet, final }: {
        factSheet: Factsheet
        final: CorrectSuburb
    } = $props()

    const { engine } = UAParser(window.navigator.userAgent) 

    let showAttribution = $state(false)

    const textPosition = engine.is("WebKit")
        ? {
            x: "330",
            y: "125",
            transformOrigin: "165 70",
            style: `transform: scale(${7.5 / final.suburb.name.length},2.3)`,
            dominantBaseline: "middle",
            transform: ""
        }
        : {
            x: "50%",
            y: "70%",
            transformOrigin: "center",
            style: "",
            dominantBaseline: "",
            transform: `scale(${7.5 / final.suburb.name.length},2.3)`
        }

</script>

<div class="bg-white relative border-black border-2 p-4 max-w-[600px] flex-1">
    <span class="[font-family:'Allura',cursive]
    absolute italic text-3xl lg:text-7xl left-2 top-2 -rotate-4 -translate-y-2 text-red-600 grid grid-cols-1 grid-rows-1">
        <span class="text-transparent bg-white scale-y-50 row-start-1 row-end-2 col-start-1 col-end-2">
            Greetings from
        </span>
        <span class="scale-y-100 row-start-1 row-end-2 col-start-1 col-end-2">
            Greetings from
        </span>
    </span>
    <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 330" preserveAspectRatio="xMidYMid meet">
        <defs>
            <mask id="text-mask-1" >
                <text x={textPosition.x} y={textPosition.y} dominant-baseline={textPosition.dominantBaseline} stroke="black" stroke-width="3" text-anchor="middle" 
                style={textPosition.style} transform={textPosition.transform}
                transform-origin={textPosition.transformOrigin} font-family="Impact, Helvetica" font-weight="bold" font-size="10em" fill="#fff">{final.suburb.name.toUpperCase()}</text>
            </mask>
        </defs>
        
        <text x={textPosition.x} y={textPosition.y}  stroke="black" dominant-baseline={textPosition.dominantBaseline} stroke-width="3" text-anchor="middle" 
            style={textPosition.style} transform={textPosition.transform}
            transform-origin={textPosition.transformOrigin} font-family="Impact, Helvetica" font-weight="bold" font-size="10em" >{final.suburb.name.toUpperCase()}</text>
        <image width="660" height="330" preserveAspectRatio="none" href="/images/suburbs/{final.suburb.name.toLowerCase()}/{final.suburb.name.toLowerCase()}.webp" mask="url(#text-mask-1)"/>
    </svg>
    {#if factSheet.attribution}
        <button
            class="absolute bottom-1 left-1 text-sm "
            aria-label="info" 
            onclick={() => showAttribution = !showAttribution}>
            <svg class="inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            {#if showAttribution}
                <span transition:fade={{"duration": 100}}>
                    Photo by {factSheet.attribution?.author}. Licensed under 
                    <a class="link" href={attribution[factSheet.attribution.type]}>{factSheet.attribution.type}</a>
                </span>
            {/if}
        </button>
    {/if}
    
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');
</style>