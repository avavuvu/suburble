<script lang="ts">
    import { gameState, type CorrectSuburb } from "$lib/gameState.svelte";
    import { getLineColor } from "$lib/guessManager";
    import type { Factsheet } from "$lib/types";
    import { onMount } from "svelte";
    import { PUBLIC_BASE_URL } from "$env/static/public";

    const { final, mount }: { final: CorrectSuburb, mount: () => void } = $props()



    const getFactsheet = async(): Promise<Factsheet> => {
        const response = await fetch(`${PUBLIC_BASE_URL}/api/factsheet/${final.suburb.name.toLowerCase()}.json`)
        
        mount()
        
        return await response.json()
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

</script>

{#await getFactsheet() then factSheet}
<li class="rounded grid grid-cols-2 h-[32rem]  gap-2 bg-gray-300 p-2 mt-8 flex-1">
    <div class=" p-2 rounded text-center col-span-2"  
            style:background-color={getBackgroundColor(final.didWin)}>
        <div class="font-bold ">{final.suburb.name}</div>
        <div>{getText(final.didWin, "Congrats")}</div>
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
        <button class="bg-white p-2 px-4 rounded">Share!</button>
    </div>
    
</li>
    
{/await}