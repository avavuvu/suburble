<script lang="ts">
    import { gameState, type Guess } from "$lib/gameState.svelte";
    import { getLineColor } from "$lib/guessManager";
    import type { MetroLines, PTVLineOverlap, TramLines } from "$lib/types";
    import distance from "@turf/distance";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import LineDisplay from "./LineDisplay.svelte";

    const { guess, scrollToBottom }: { guess: Guess, scrollToBottom: () => void } = $props()

    onMount(scrollToBottom)
    
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

<li class="rounded flex gap-2 bg-gray-300 p-2">
    {#if guess.guessesLeft <= 3}
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
        <LineDisplay overlap={guess.overlap} button={{enabled: true, func: setLineText}}></LineDisplay>
    </div>
</li>