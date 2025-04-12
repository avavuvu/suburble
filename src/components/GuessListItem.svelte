<script lang="ts">
    import { gameState, type Guess } from "$lib/gameState.svelte";
    import { getLineColor } from "$lib/guessManager";
    import type { MetroLines, PTVLineOverlap, TramLines } from "$lib/types";
    import distance from "@turf/distance";
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    const { guess, mount }: { guess: Guess, mount: () => void } = $props()

    onMount(mount)

    const getOverlapBackgroundColor = (overlap: "some" | "every" | "none") => {
        switch(overlap) {
            case "every":
                return "var(--color-correct)"
            case "none": 
                return "var(--color-incorrect)"
            case "some":
                return "var(--color-half-correct)"
        }
    }
    
    const getDistanceBackgroundColor = (distance: number) => {
        if(distance === 0) {
            return "var(--color-correct)"
        }

        if(distance < 5) {
            return "var(--color-half-correct)"
        }

        return "var(--color-incorrect)"
    }

    const getSuburbBackgroundColor = (isCorrect: boolean) => {
        if(isCorrect) {
            return "var(--color-correct)"
        }

        return "var(--color-incorrect)"
    }

    const getLineDisplay = (overlap: PTVLineOverlap) => {
        const backgroundColor = getOverlapBackgroundColor(guess.overlap.type)

        if(guess.overlap.type === "none") {
            return {
                lines: [],
                type: "empty",
                backgroundColor
            }
        }

        if(overlap.lines.length > 10) {
            const colorSet = new Set<string>(overlap.lines.map((line) => getLineColor(line)))

            return {
                lines: [...colorSet].slice(0,3).map(color => ({color, line: ""})),
                ellipses: `...${overlap.lines.length - 3} more routes`,
                type: "compressed",
                backgroundColor
            }
        }

        const linesDisplay = overlap.lines.map(line => ({
            line,
            color: getLineColor(line)
        }))

        return {
            lines: linesDisplay,
            type: "full",
            backgroundColor
        }
    }

    const lineDisplay = getLineDisplay(guess.overlap)

    const setDistanceText = () => {
        gameState.setHelpText({
            type: "Distance",
            distanceToTarget: guess.distanceToTarget,
            cardinal: guess.cardinalToTarget,
            suburb: guess.suburb
        })
    }

    const setLineText = () => {
        gameState.setHelpText({
            type: "Line",
            overlap: guess.overlap,
            suburb: guess.suburb
        })
    }

    const setLivesText = () => {
        gameState.setHelpText({
            type: "Lives",
            lives: gameState.guessesLeft
        })
    }
</script>

<li class="rounded p-2 flex gap-2">
    {#if gameState.guessesLeft <= 3}
        <button 
            onclick={setLivesText}
            class="flex flex-col">
            {#if guess.guessesLeft === 1}
                💔
            {:else}
                {#each Array.from({length: guess.guessesLeft}) }
                    <span>
                        ❤️
                    </span>
                {/each}
            {/if}
        </button>
    {/if}
    <div class="grid grid-cols-2 grid-rows-[auto_auto] gap-2 flex-1 w-full ">
        <div class="font-bold p-1 rounded bg-incorrect text-center"  
            style:background-color={getSuburbBackgroundColor(guess.isCorrect)}>
            <span>{guess.suburb.name}</span>
        </div>
        <button 
            onclick={setDistanceText}
            class="block p-1 bg-gray-300 rounded text-center "
            style:background-color={getDistanceBackgroundColor(guess.distanceToTarget)}>
            <span>
                {guess.distanceToTarget.toFixed(2).slice(0,4)}km 
            </span>
            <span class="bg-white p-1 rounded">
                {guess.emojiDirection} 
            </span>
        </button>
        {#if lineDisplay.type === "empty"}
            <button 
                onclick={setLineText}
                class="block line-clamp-2 rounded p-1 col-span-2"
                style:background-color={lineDisplay.backgroundColor}>
                <span class="italic text-center">
                    Not on the same line
                </span>
            </button>
        {:else}
            <button 
                onclick={setLineText}
                class="line-clamp-2 rounded gap-2 flex flex-wrap text-sm md:text-base lg:text-base col-span-2">
                {#each lineDisplay.lines as {line, color}}
                    {#if lineDisplay.type === "compressed"}
                        <span 
                            class="inline-flex justify-center flex-1 items-center p-1 gap-1 rounded "
                            style:background-color={lineDisplay.backgroundColor}>
    
                            <span 
                                class="h-4 w-4 aspect-square rounded-4xl border-2 border-white" 
                                style:background-color={color}>
                            </span>
    
                        </span>
                    {:else}
                        <span 
                            class="inline-flex items-center p-1 flex-1  gap-1 rounded "
                            style:background-color={lineDisplay.backgroundColor}>
    
                            <span 
                                class="h-4 w-4 aspect-square rounded-4xl border-2 border-white" 
                                style:background-color={color}></span>
                            <span class="rounded w-full" >{line}</span>
                        </span>
                    {/if}
                {/each}
    
                {#if lineDisplay.type === "compressed"}
                    <span class="text-center italic bg-incorrect rounded p-1">
                        {lineDisplay.ellipses}
                    </span>
                {/if}
            </button>
        {/if}
    </div>
</li>