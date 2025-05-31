<script lang="ts">
    import { getLineColor } from "$lib/guessManager";
    import type { PTVLineOverlap } from "$lib/types";

    const { overlap, button }: {overlap: PTVLineOverlap, button: {
        enabled: boolean,
        func: () => void
    }} = $props()

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

    const getLineDisplay = (overlap: PTVLineOverlap) => {
        const backgroundColor = getOverlapBackgroundColor(overlap.type)

        if(overlap.type === "none") {
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

    const lineDisplay = getLineDisplay(overlap)
</script>

{#if lineDisplay.type === "empty"}
    <button 
        onclick={button.func}
        class="block line-clamp-2 rounded p-1 col-span-2"
        style:background-color={lineDisplay.backgroundColor}>
        <span class="italic text-center">
            Not on the same train line
        </span>
    </button>
{:else}
    <button 
        onclick={button.func}
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