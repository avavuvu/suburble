<script lang="ts">
    import getTrainLineColor from "$lib/utils/getTrainLineColor";
    import getTrainLineName from "$lib/utils/getTrainLineName";
    import type { GoodnessColor } from "@t/feed";
    import type { TrainLineName } from "@t/trainLine";

    const { trainLines }: {
        trainLines: Map<TrainLineName, GoodnessColor>
    } = $props()

    const trainLinesDisplay = Array.from(trainLines)
        .sort(([,goodnessA]) => 
            goodnessA === "green" ? -1 : 1)

</script>

<div class="grid grid-cols-2 gap-0.5 lg:grid-cols-3  text-sm md:text-base lg:text-base">
    {#each trainLinesDisplay as [trainLine, color]}
        <span 
            class="{color} inline-flex items-center p-1 flex-1  gap-1 rounded">
    
            <span 
                class="h-4 w-4 aspect-square rounded-4xl border-2 border-white" 
                style:background-color={getTrainLineColor(trainLine)}></span>
            <span class="rounded w-full" >{getTrainLineName(trainLine)}</span>
        </span>
    {/each}

</div>