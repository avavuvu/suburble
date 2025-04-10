<script lang="ts">
    import type { Guess } from "$lib/gameState.svelte";
    import { onMount } from "svelte";

    const { guess, mount }: { guess: Guess, mount: () => void } = $props()

    onMount(mount)
</script>

<li class="grid grid-cols-[42%_20%_auto] gap-2 py-1">
    <div class="font-bold p-1 rounded" class:bg-gray-300={!guess.isCorrect} class:bg-green-500={guess.isCorrect} >
        <span>{guess.suburb.name}</span>
    </div>
    <div class="p-1 bg-gray-300 rounded text-center">
        <span>
            {guess.emojiDirection} {guess.distanceToTarget.toFixed(2).slice(0,4)}km 
        </span>
    </div>
    <div class="p-1 bg-gray-300 rounded line-clamp-2  gap-2 flex flex-wrap" class:bg-green-500={guess.correctTrainLines.length > 0}>
        {#each guess.correctTrainLines as {line, color}}
        <span class="inline-flex justify-center items-center">
            <span class="h-4 w-4 rounded-4xl border-2 border-white" style:background-color={color}></span>
            <span class="rounded w-full" >{line}</span>

        </span>

        {/each}
    </div>
</li>