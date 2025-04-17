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
    import FinalSuburb from "./FinalSuburb.svelte";

    import suburbNamesJson from "../json/suburbNames.json"
    import { suburbCache } from "$lib/suburbCache";

    const suburbNames = (suburbNamesJson as unknown )as string[]

    let inputValue = $state("")
    let inputElement!: HTMLInputElement 
    let guessList!: HTMLElement


    const getPotentialSuburbs = (input: string) => {
        return suburbNames.filter(name => {
            return name.toLowerCase().includes(input)
        })
    }

    const findSuburb = (input: string) => 
        suburbNames.find(name => input === name.toLowerCase())

    const inputChanged = async (event: Event) => {
        const inputEvent = event as InputEvent
        const isDropDownSelection = inputEvent.inputType === "insertReplacementText";
        const normalizedInput = inputValue.toLowerCase();

        const potentialSuburbs = getPotentialSuburbs(normalizedInput)

        if(potentialSuburbs.length < 8) {
            const cacheSuburbs = potentialSuburbs.map(suburb => suburbCache.get(suburb))

            await Promise.all(cacheSuburbs)
        }

        // If not selected from datalist dropdown, return
        if (!isDropDownSelection) {
            return
        }

        const suburb = findSuburb(normalizedInput);
        if (!suburb) { return }

        await attemptGuess(suburb);
        inputValue = ""
    };
    
    const submit: EventHandler<SubmitEvent, HTMLFormElement> = async (event) => {
        event.preventDefault(); 

        const formData = new FormData(event.currentTarget)
        const suburbName = formData.get("suburb")

        const normalizedInput = String(suburbName).toLowerCase()

        let suburb = findSuburb(normalizedInput) ?? null

        if(!suburb) {
            const matches = getPotentialSuburbs(normalizedInput)

            if(matches.length === 1) {
                suburb = findSuburb(matches[0].toLowerCase()) ?? null
            } else {
                return
            }
        }

        inputValue = ""
        await attemptGuess(suburb)        
    }
    

    const attemptGuess = async (suburbName: string | null): Promise<boolean> => {
        // guess invalid
        if(suburbName === null) {
            return false
        }

        const suburb = (await suburbCache.get(suburbName))!

        const previouslyGuessed = gameState.guesses.has(suburbName.toLowerCase())
        if(previouslyGuessed) {
            return false
        }

        // guess valid
        inputValue = ""

        gameState.addGuess(suburb)

        return true
    }


    const scrollToBottom = () => {
        guessList.scrollTo({
                "top": 10000,
                "behavior": "smooth"
            })
    }

    let giveUpStatus = $state(0)
    const incrementGiveUp = () => {
        if(giveUpStatus === 0) {
            giveUpStatus ++
        }else {
            gameState.giveUp()
        }
    }

    let expanded = $state(false)

    gameState.on("gameEnded", () => {
        expanded = true
    })

    $effect(() => {
        document.addEventListener("keydown", () => {
            inputElement.focus()
        })
    })

</script>



<div class="fixed bottom-12 w-full">
    <div class="w-[90vw] mx-auto flex justify-between m-1 ">
        {#if gameState.guesses.size > 2 || gameState.gameState === "ended"}
        <button class="cursor-pointer block  p-2  border-incorrect border-4 rounded-xl bg-white"
            onclick={() => expanded = !expanded}> 
            {#if expanded}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
            {/if}
        </button>
        {/if}

        {#if gameState.guessesLeft < 5 && gameState.gameState === "playing"}
            <button class="cursor-pointer block  p-2  border-incorrect border-4 rounded-xl"
                style:background-color={giveUpStatus === 0 ? "var(--color-white)" : "var(--color-red-400)"} 
                style:color={giveUpStatus === 0 ? "var(--color-black)" : "var(--color-white)"} 
                onclick={incrementGiveUp}> 
                {#if giveUpStatus === 0}
                    give up
                {:else}
                    are you sure?
                {/if}
            </button>
        {/if}
        
    </div>


    <div class="bg-white w-[90vw] mx-auto rounded-xl p-2">
            <div>
                <ul id="guess-list" class:expanded bind:this={guessList} class="overflow-scroll flex flex-col gap-4 lg:gap-2">
                    {#each gameState.guesses as [_, guess]}
                        {#if guess.type === "guess"}
                            <GuessListItem { guess } {scrollToBottom}></GuessListItem>
                            
                        {:else}
                            <FinalSuburb final={guess} {scrollToBottom}></FinalSuburb>
                        {/if}
                    {/each}
                </ul>
            </div>

            {#if gameState.gameState === "playing"}

            <div class="flex justify-between py-2">
                <p id="help-text" class="italic px-2 min-h-12 lg:min-h-6 md:min-h-6 line-clamp-2 lg:line-clamp-1 md:line-clamp-1">{gameState.helpText}</p> 
            </div>

            <form onsubmit={submit}>
                <div class="inline-flex w-full gap-2">
                    <input 
                        bind:this={inputElement}
                        placeholder="Ringwood..."
                        autocomplete="off"
                        oninput={inputChanged}
                        bind:value={inputValue}
                        class="border border-black w-full rounded px-2"
                        list="suburbs" name="suburb" id="suburb">
                    <button type="submit">✅</button>
                </div>

                <datalist id="suburbs">
                    {#if inputValue.length > 2}
                        {#each suburbNames as suburb}
                            <!-- svelte-ignore node_invalid_placement_ssr -->
                            <option value={suburb}></option>
                        {/each}
                        
                    {/if}
                </datalist>
            </form>
                
            {/if}

    </div>

</div>

<style>
    #guess-list {
        transition: all;
        transition-duration: 500ms;
        max-height: 12rem;
    }

    #guess-list.expanded {
        max-height: 80vh;
    }

</style>