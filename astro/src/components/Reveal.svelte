<script lang="ts">
    import type { FeedReveal, GoodnessColor } from "@t/feed";
    import TrainLineDisplay from "./TrainLineDisplay.svelte";
    import type { TrainLineName } from "@t/trainLine";
    import Share from "./Share.svelte";
    import gameManager from "@lib/gameManager.svelte.ts";
    import { attribution } from "@t/faceSheet";
    import { slide } from "svelte/transition";


    const { feedItem }: { feedItem: FeedReveal } = $props()

    const { didWin,  bestGuess } = feedItem.revealData
    const { factSheet, suburb } = feedItem

    // add one because the reveal counts as an extra guess
    // kind of dodgy code
    const guesses = feedItem.revealData.guesses + (didWin ? 1 : 0)

    const trainLines = new Map<TrainLineName,GoodnessColor>(suburb.trainLines.map(trainLine => [trainLine,"green"]))

    

</script>

<div 
    transition:slide={{ delay: 1000 }}
    class="rounded grid grid-cols-2 gap-2 p-2 mt-8 flex-1">
    <div class=" p-2 rounded text-center col-span-2"  >
        <div class="font-bold text-2xl ">{suburb.name}</div>
        <div>{didWin 
            ? `Congrats! You solved today's Suburble in ${guesses} guess${guesses === 1 ? "" : "es"}!`
            : `Better luck next time!` + 
                bestGuess 
                    ? `Your best guess of ${bestGuess!.suburb.name} was only ${bestGuess?.directionInfo.distanceToTarget.toFixed(1)}km away!` 
                    : ""
        }</div>
    </div>
    {#if gameManager.hasImage}
    <div class=" p-1 rounded text-center flex-col col-span-2 flex justify-center bg-incorrect">
        <img 
            class="aspect-video object-cover border border-black rounded"
            alt="{suburb.name}"
            src="/images/suburbs/{suburb.name.toLowerCase()}/{suburb.name.toLowerCase()}.webp"> 
        {#if factSheet.attribution}
            <p class="text-sm text-gray-600">
                Photo by {factSheet.attribution.author}
            </p>
            <p class="text-sm text-gray-600">
                Licensed under 
                <a class="link" href={attribution[factSheet.attribution.type]}>
                    {factSheet.attribution.type}
                </a>
            </p>
            
        {/if}
    </div>
        
    {/if}

    <div class="p-1 rounded  col-span-2"  >
        <TrainLineDisplay {trainLines}></TrainLineDisplay>
    </div>
    <hr class="col-span-2">
    {#if factSheet.population}
        <span class=" text-left  p-2 gap-1 rounded bg-incorrect">
            <div class="font-bold">Population</div>
            <div>{Number(factSheet.population).toLocaleString()}</div>
        </span>
    {/if}
    {#if factSheet.housePrice}
        <span class=" text-left p-2  gap-1 rounded">
            <div class="font-bold">Median House Price</div>
            <div>{Number(factSheet.housePrice).toLocaleString()}</div>
        </span>
    {/if}

    {#if factSheet.etymology}
        <div class="p-2 rounded justify-start col-span-2">
            <div class="font-bold">Language of Origin</div>
            <div>{factSheet.etymology.language}</div>
            <div class="italic">{factSheet.etymology.description}</div>
        </div>
        
    {/if}
    <div class="p-2 rounded justify-center flex col-span-2">
        <Share {feedItem}></Share>
    </div>
</div>
