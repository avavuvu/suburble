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
    import { getCorrectTrainLines } from "$lib/guessManager";
    import GuessListItem from "./GuessListItem.svelte";

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

        const isCorrect = suburb.name === targetSuburb.name

        const distanceToTarget = distance(
            targetSuburb.centroid, 
            suburb.centroid,
            { units: "kilometres"}
        )

        const directionToTarget = bearing(
            suburb.centroid,
            targetSuburb.centroid, 
        )

        const cardinalToTarget: "N" | "S" | "E" | "W" = {
            0:      "N",
            "-0":   "N",
            90:     "E",
            180:    "S",
            270:    "W",
            "-90":  "W",

        }[Math.round((directionToTarget + 90) / 90) * 90]! as "N" | "S" | "E" | "W"
        
        let emojiDirection = {
            "N": "☝️",
            "S": "👇",
            "E": "👉",
            "W": "👈",
        }[cardinalToTarget]

        if(isCorrect) {
            emojiDirection = "👍"
        }

        const correctTrainLines = getCorrectTrainLines(suburb, targetSuburb)

        

        const newGues: Guess = {
            isCorrect,
            suburb,
            distanceToTarget,
            directionToTarget,
            cardinalToTarget,
            emojiDirection,
            correctTrainLines: correctTrainLines
        }

        gameState.addGuess(newGues)

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
    <button class="border px-2 cursor-pointer" onclick={() => gameState.giveUp()}> give up</button>
    <ul bind:this={guessList} class="max-h-56 overflow-scroll">
        {#each gameState.guesses.entries().toArray() as [_, guess]}
            <GuessListItem { guess } mount={scrollToBottom}></GuessListItem>

        {/each}
        
    </ul>
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




<style></style>