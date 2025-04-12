<script lang="ts">
    import type { Suburb, Coordinates } from "$lib/types";
    import type { EventHandler, FormEventHandler } from "svelte/elements";
    import MapLibreGl from "maplibre-gl"
    import { convertCoordinatesToGeoJsonPolygon } from "$lib/GeoJsonUtil";
    import { SvelteMap } from "svelte/reactivity";
    import distance from "@turf/distance";
    import { sineIn } from "svelte/easing";
    import { gameState, type Guess } from "$lib/gameState.svelte";
    import { bearing } from "@turf/turf";
    import GuessListItem from "./GuessListItem.svelte";
    import { getLineOverlap } from "$lib/guessManager";
    import { generateHelpText } from "$lib/help";

    const { suburbs, targetSuburb }: { suburbs: Suburb[], targetSuburb: Suburb } = $props()

    const suburbMap = new Map<string, Suburb>(
        suburbs.map((suburb) => {
            return [
                suburb.name.toLowerCase(),
                suburb
            ]
        })
    )

    let inputValue = $state("")

    const getPotentialSuburbs = (input: string) => {
        return Array.from(suburbMap.keys()).filter(name =>
                name.toLowerCase().includes(input)
            )
    }

    const inputChanged = (event: Event) => {
        const inputEvent = event as InputEvent
        const isDropDownSelection = inputEvent.inputType === "insertReplacementText";
        const normalizedInput = inputValue.toLowerCase();

        // If not selected from datalist dropdown, require exactly one match
        if (!isDropDownSelection) {
            const matches = getPotentialSuburbs(normalizedInput)

            if (matches.length !== 1) { return }
        }

        const suburb = suburbMap.get(normalizedInput);
        if (!suburb) { return }

        attemptGuess(suburb);
        inputValue = ""
    };
    
    const submit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault(); 

        const formData = new FormData(event.currentTarget)
        const suburbName = formData.get("suburb")

        const normalizedInput = String(suburbName).toLowerCase()

        let suburb = suburbMap.get(normalizedInput) ?? null

        if(!suburb) {
            const matches = getPotentialSuburbs(normalizedInput)

            if(matches.length === 1) {
                suburb = suburbMap.get(matches[0]) ?? null
            } else {
                return
            }
        }

        inputValue = ""
        attemptGuess(suburb)        
    }
    

    const attemptGuess = (suburb: Suburb | null): boolean => {
        // guess invalid
        if(suburb === null) {
            return false
        }

        const previouslyGuessed = gameState.guesses.has(suburb.name.toLowerCase())
        if(previouslyGuessed) {
            return false
        }

        // guess valid
        inputValue = ""


        gameState.addGuess(suburb)

        return true
    }


    let guessList!: HTMLElement

    const scrollToBottom = () => {
        guessList.scrollTo({
                "top": 10000,
                "behavior": "smooth"
            })
    }

</script>

<div>
    
    <ul bind:this={guessList} class="max-h-56 lg:max-h-48 overflow-scroll flex flex-col gap-4 lg:gap-2">
        {#each gameState.guesses.entries().toArray() as [_, guess]}
            <GuessListItem { guess } mount={scrollToBottom}></GuessListItem>
        {/each}
    </ul>
</div>

{#if gameState.gameState === "playing"}
    <div class="flex justify-between">
        <p id="help-text" class="italic px-2 min-h-12 lg:min-h-6 md:min-h-6 line-clamp-2 lg:line-clamp-1 md:line-clamp-1">{gameState.helpText}</p> 
        <button class="border px-2 cursor-pointer" onclick={() => gameState.giveUp()}> give up</button>
    </div>
    <form onsubmit={submit}>
        <input 
            placeholder="Ringwood..."
            autocomplete="off"
            oninput={inputChanged}
            bind:value={inputValue}
            class="border border-black w-full rounded px-2"
            list="suburbs" name="suburb" id="suburb">

        <datalist id="suburbs">
            {#if inputValue.length > 2}
                {#each suburbs as suburb}
                    <!-- svelte-ignore node_invalid_placement_ssr -->
                    <option value={suburb.name}></option>
                {/each}
                
            {/if}
        </datalist>
    </form>
    
{/if}




<style></style>