<script lang="ts">
    import type { FeedItem } from "@t/feed";
    import { slide } from "svelte/transition";
    import TrainLineDisplay from "./TrainLineDisplay.svelte";
    import { onMount } from "svelte";
    import Reveal from "./Reveal.svelte";

    const {
        feedItem,
        scrollToBottom,
    }: {
        feedItem: FeedItem;
        scrollToBottom: () => void;
    } = $props();

    onMount(() => scrollToBottom());

    const animateInTimeMs = 400 as const;
</script>

<li
    transition:slide
    class:shake={feedItem.type === "guess" && feedItem.isLastGuess}
    class="rounded border bg-white border-black overflow-clip p-1 my-2 shrink-0"
>
    {#if feedItem.type === "guess"}
        {@const { emojiDirection, distanceToTarget, directionToTarget } =
            feedItem.guess.directionInfo}
        {@const goodness = feedItem.guessComponentsGoodness}
        <div class="grid grid-cols-2 grid-rows-[auto_auto] gap-2 flex-1 w-full">
            <div
                class="
                {feedItem.isLastGuess ? 'red' : goodness.distanceToTarget} 
                font-bold p-1 rounded text-center"
            >
                <span>{feedItem.guess.suburb.name}</span>
            </div>

            <div
                style:animation-delay="{animateInTimeMs * 1}ms"
                class="animate-in rounded {goodness.distanceToTarget} p-1 text-center inline-flex gap-2 justify-center"
            >
                <div
                    class="bg-white rounded-4xl aspect-square border-black border"
                    style:transform={`rotate(${directionToTarget + emojiDirection.offset}deg)`}
                >
                    {emojiDirection.emoji}
                </div>
                <span
                    ><span class="font-bold"
                        >{distanceToTarget.toFixed(2).slice(0, 4)}km</span
                    > away
                </span>
            </div>
            <div
                style:animation-delay="{animateInTimeMs * 2}ms"
                class="animate-in rounded col-span-2 gray p-1 {feedItem.overlap
                    .type === 'phrase'
                    ? feedItem.overlap.color
                    : ''}"
            >
                {#if feedItem.overlap.type === "phrase"}
                    <div class="p-1">
                        {feedItem.guess.suburb.name}
                        {feedItem.overlap.phrase}
                    </div>
                {:else}
                    <TrainLineDisplay
                        trainLines={feedItem.overlap.trainLines}
                    />
                {/if}
            </div>
        </div>
    {:else if feedItem.type === "clue"}
        <div
            class="
                bg-red-400 text-white rounded
                w-full text-center flex justify-center items-center overflow-clip h-12"
        >
            <span>
                {@html feedItem.clue}
            </span>
        </div>
    {:else if feedItem.type === "reveal"}
        <Reveal {feedItem}></Reveal>
    {/if}
</li>

<style>
    .animate-in {
        animation: animate-in 0.1s ease-in-out forwards;
        opacity: 0;
    }

    @keyframes animate-in {
        0% {
            transform: translateY(100%);
            opacity: 0;
        }
        100% {
            transform: translateY(0%);
            opacity: 1;
        }
    }

    .shake {
        animation: shake 0.2s ease-in-out 0s 2;
    }

    @keyframes shake {
        0% {
            margin-left: 0rem;
        }
        25% {
            margin-left: 1rem;
        }
        75% {
            margin-left: -1rem;
        }
        100% {
            margin-left: 0rem;
        }
    }
</style>
