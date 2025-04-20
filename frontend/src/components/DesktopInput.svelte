<script lang="ts">
    import { suburbCache } from "$lib/suburbCache";
    import type { SuburbQuery } from "$lib/suburbQuery";
    import type { EventHandler } from "svelte/elements";

    const { attemptGuess, suburbQuery }: {
        attemptGuess: (suburbName: string | null) => Promise<boolean>,
        suburbQuery: SuburbQuery
    } = $props()

    let inputElement!: HTMLInputElement 
    let inputValue = $state("")

    $effect(() => {
        document.addEventListener("keydown", () => {
            inputElement.focus()
        })
    })

    const inputChanged = async (event: Event) => {
        const inputEvent = event as InputEvent
        const isDropDownSelection = inputEvent.inputType === "insertReplacementText";
        const normalizedInput = inputValue.toLowerCase();

        const potentialSuburbs = suburbQuery.getPotentialSuburbs(normalizedInput)

        if(potentialSuburbs.length < 8) {
            const cacheSuburbs = potentialSuburbs.map(suburb => suburbCache.get(suburb))

            await Promise.all(cacheSuburbs)
        }

        // If not selected from datalist dropdown, return
        if (!isDropDownSelection) {
            return
        }
        await attemptGuess(normalizedInput);
        inputValue = ""
    };
    
    const submit: EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
        event.preventDefault(); 

        const formData = new FormData(event.currentTarget)
        const suburbName = formData.get("suburb")

        const normalizedInput = String(suburbName).toLowerCase()

        let suburb = suburbQuery.findSuburb(normalizedInput) ?? null

        if(!suburb) {
            const matches = suburbQuery.getPotentialSuburbs(normalizedInput)

            if(matches.length === 1) {
                suburb = suburbQuery.findSuburb(matches[0].toLowerCase()) ?? null
            } else {
                return
            }
        }

        inputValue = ""
        attemptGuess(suburb)        
    }
</script>

<form onsubmit={submit}>
    <div class="inline-flex w-full gap-2">
        <input 
            bind:this={inputElement}
            placeholder={suburbQuery.getPlaceholder()}
            autocomplete="off"
            oninput={inputChanged}
            bind:value={inputValue}
            class="border border-black w-full rounded px-2"
            list="suburbs" name="suburb" id="suburb">
        <button type="submit">✅</button>
    </div>

    <datalist id="suburbs">
        {#if inputValue.length > 2}
            {#each suburbQuery.suburbNames as suburb}
                <!-- svelte-ignore node_invalid_placement_ssr -->
                <option value={suburb}></option>
            {/each}
        {/if}
    </datalist>
</form>