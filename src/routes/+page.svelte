<script lang="ts">
    import type { Suburb } from "$lib/types";
    import GamePage from "../components/GamePage.svelte";
    import suburbsJson from "../json/suburbs.json"
    const suburbs = (suburbsJson as unknown) as Suburb[]

    let targetSuburb: null | Suburb = $state(null)

    let value = $state("")
    const change = () => {
        const suburb = suburbs.find(({name}) => name === value)

        targetSuburb = suburb!
    }

    const pickRandomSuburb = () => {
        targetSuburb = suburbs[Math.floor(Math.random() * suburbs.length)]
    }
</script>

{#if targetSuburb === null}
    <div class="text-center">

        <h1>my little game :)</h1>
        <p>press start to play!</p>
    
        <button onclick={pickRandomSuburb} class="border-2 p-4 px-8 cursor-pointer">
            start
        </button>
        <select class="block" onchange={change} bind:value={value}>
            {#each suburbs as suburb}
                <option value={suburb.name}>
                    {suburb.name}
                </option>
            {/each}
        </select>
    </div>
{:else}
    <GamePage {targetSuburb}></GamePage>
{/if}




