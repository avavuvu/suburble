<script lang="ts">
    import { suburbCache } from "$lib/suburbCache";
    import type { SuburbQuery } from "$lib/suburbQuery";
    import { slide } from "svelte/transition";

    const { attemptGuess, suburbQuery }: {
        attemptGuess: (suburbName: string | null) => Promise<boolean>,
        suburbQuery: SuburbQuery
    } = $props()

    let inputElement!: HTMLInputElement 
    let inputValue = $state("")

    let potentialSuburbs: string[] = $state([])

    const inputChanged = async () => {
        const normalizedInput = inputValue.toLowerCase();

        potentialSuburbs = suburbQuery.getPotentialSuburbs(normalizedInput)

        if(potentialSuburbs.length < 8) {
            const cacheSuburbs = potentialSuburbs.map(suburb => suburbCache.get(suburb))

            await Promise.all(cacheSuburbs)
        }
    }

    const makeGuess = async (suburbName: string) => {
        const success = await attemptGuess(suburbName)

        inputValue = ""

    }


</script>

<div class="relative">
    {#if inputValue.length > 2 && potentialSuburbs.length > 0}
        <div transition:slide 
            class="absolute h-48 w-full bottom-8 bg-incorrect overflow-scroll p-2
                rounded shadow-2xl">
            {#each potentialSuburbs as suburb}
                <button onclick={async () => await makeGuess(suburb)} class="block">
                    {suburb}

                </button>
            {/each}
        </div>
        
    {/if}

    <div class="inline-flex w-full gap-2">
        <input 
            type="text"
            bind:this={inputElement}
            placeholder={suburbQuery.getPlaceholder()}
            autocomplete="off"
            oninput={inputChanged}
            bind:value={inputValue}
            class="border border-black w-full rounded px-2">
        <button onclick={() => makeGuess(inputValue)}>✅</button>
    </div>
</div>