<script lang="ts">
    import feedManager from "@lib/feedManager.svelte.ts";
    import { fly, slide } from "svelte/transition";
    import TrainLineDisplay from "./TrainLineDisplay.svelte";
    import FeedItem from "./FeedItem.svelte";
    import gameManager from "@lib/gameManager.svelte.ts";

    let guessList!: HTMLUListElement;

    const scrollToBottom = () => {
        // guessList.scrollTo({
        //     top: guessList.scrollHeight,
        //     behavior: 'smooth'
        // });
    };
</script>

<div class="bg-gray-100">
    <ul
        class:expanded={gameManager.expanded}
        bind:this={guessList}
        id="guess-list"
        class=" overflow-y-auto flex flex-col-reverse gap-4 pb-8 lg:gap-2 w-[90%] max-w-[600px] mx-auto pt-1"
    >
        {#each feedManager.feed as feedItem (feedItem.key)}
            <FeedItem {feedItem} {scrollToBottom} />
        {/each}
    </ul>
</div>

<style>
    #guess-list {
        max-height: 12rem;
        transition: all;
        transition-duration: 500ms;
        min-height: 2rem;
    }

    #guess-list.expanded {
        max-height: 75vh;
        min-height: 25vh;
    }
</style>
