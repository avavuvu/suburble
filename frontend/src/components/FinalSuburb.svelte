<script lang="ts">
    import { gameState, type CorrectSuburb } from "$lib/gameState.svelte";
    import { getLineColor } from "$lib/guessManager";
    import { attribution, type Factsheet } from "$lib/types";
    import { onMount } from "svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { fade } from "svelte/transition";
    import Share from "./Share.svelte";

    const { final, scrollToBottom }: { final: CorrectSuburb, scrollToBottom: () => void } = $props()



    const getFactsheet = async(): Promise<Factsheet> => {
        const response = await fetch(`${PUBLIC_BASE_URL}/api/factsheet/${final.suburb.name.toLowerCase()}.json`)
        
        scrollToBottom()
        
        return await response.json()
    }

    const getTextColor = (didWin: boolean) => {
        if(didWin) {
            return "var(--color-white)"
        }

        return "var(--color-black)"
    }

    const getBackgroundColor = (didWin: boolean) => {
        if(didWin) {
            return "var(--color-correct)"
        }

        return "var(--color-incorrect)"
    }

    type FinalTexts = "Congrats" 

    const getText = (didWin: boolean, key: FinalTexts) => {
        const victoryStatus = didWin ? "win" : "lose" 

        return textMap[key][victoryStatus]
    }

    const textMap: Record<FinalTexts, {win: string, lose: string}> = {
        "Congrats": {
            win: `Congratulations! You found today's suburb in ${gameState.maxGuesses - gameState.guessesLeft} guesses!`,
            lose: gameState.bestGuess 
                ? `Better luck next time! Your best guess of ${gameState.bestGuess.suburb.name} was only ${gameState.bestGuess.distanceToTarget.toFixed(0)}km away.`
                : `Better luck next time!`
        },
    }


    const linesDisplay = final.suburb.lines.map(line => ({
        line,
        color: getLineColor(line)
    }))

    let showAttribution = $state(false)

</script>

{#await getFactsheet() then factSheet}
<li class="rounded grid grid-cols-2 gap-2 bg-gray-300 p-2 mt-8 flex-1">
    <div class=" p-2 rounded text-center col-span-2"  
            style:background-color={getBackgroundColor(final.didWin)}
            style:color={getTextColor(final.didWin)}>
        <div class="font-bold ">{final.suburb.name}</div>
        <div>{getText(final.didWin, "Congrats")}</div>
    </div>
    <div class=" p-2 rounded text-center col-span-2 flex justify-center bg-incorrect">

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
                <svg width="100%" height="100%" viewBox="0 0 660 330">
                    <defs>
                        <mask id="text-mask-1" >
                            <text x="50%" y="70%" stroke="black" stroke-width="3" text-anchor="middle" transform="scale({7.5 / final.suburb.name.length},2.3)"  transform-origin="center" font-family="Impact, Helvetica" font-weight="bold" font-size="10em" fill="#fff">{final.suburb.name.toUpperCase()}</text>
                        </mask>
                    </defs>
                    
                    <text x="50%" y="70%" stroke="black" stroke-width="3" text-anchor="middle" transform="scale({7.5 / final.suburb.name.length},2.3)"  transform-origin="center" font-family="Impact, Helvetica" font-weight="bold" font-size="10em" >{final.suburb.name.toUpperCase()}</text>
                    <image width="660" height="330" preserveAspectRatio="none"   xlink:href="/images/suburbs/{final.suburb.name.toLowerCase()}/{final.suburb.name.toLowerCase()}.webp" mask="url(#text-mask-1)"/>
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
    </div>
    <div class="p-1 rounded  bg-incorrect flex flex-wrap justify-start"  >
        {#each linesDisplay as {line, color}}
            <span class="inline-flex items-center p-1  gap-1 rounded bg-incorrect">
                <span 
                    class="h-4 w-4 aspect-square rounded-4xl border-2 border-white" 
                    style:background-color={color}></span>
                <span class="rounded" >{line}</span>
            </span>
        {/each}
    </div>
    <div class="p-2 rounded  bg-incorrect flex flex-col justify-start"  >
        {#if factSheet.population}
            <span class=" text-left  gap-1 rounded bg-incorrect">
                <div class="font-bold">Population</div>
                <div>{Number(factSheet.population).toLocaleString()}</div>
            </span>
        {/if}
        {#if factSheet.housePrices}
            <span class=" text-left  gap-1 rounded bg-incorrect">
                <div class="font-bold">Median House Price</div>
                <div>{Number(factSheet.housePrices).toLocaleString()}</div>
            </span>
        {/if}
    </div>
    {#if factSheet.etymology}
        <div class="p-2 rounded  bg-incorrect justify-start col-span-2">
            <div class="font-bold">Language of Origin</div>
            <div>{factSheet.etymology.language}</div>
            <div class="italic">{factSheet.etymology.description}</div>
        </div>
        
    {/if}
    <div class="p-2 rounded  bg-incorrect justify-center flex col-span-2">
        <Share {final}></Share>
    </div>
    
</li>
    
{/await}

<style>
    @import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

    .bg-clip {
        font-weight: bold;
        font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
        color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        background-image: url(/images/suburbs/carlton/carlton.avif);
        background-size: cover;
        background-position: center;
    }
</style>