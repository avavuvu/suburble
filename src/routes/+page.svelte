<script lang="ts">
    import { goto } from "$app/navigation";
    import { gameState } from "$lib/gameState.svelte";
    import type { Suburb } from "$lib/types";
    import GamePage from "../components/GamePage.svelte";
    import suburbNamesJson from "../json/suburbNames.json"
    const suburbNames = (suburbNamesJson as unknown )as string[]
    import { PUBLIC_BASE_URL } from "$env/static/public";

    let value = $state("")
    const change = async () => {
        const suburb = suburbNames.find((name) => name === value)

        const response = await fetch(`${PUBLIC_BASE_URL}/api/suburb/${suburb!.toLowerCase()}.json`)
        gameState.targetSuburb = await response.json()
        // goto("/game")
    }

    const pickRandomSuburb = async () => {
        const suburb = suburbNames[Math.floor(Math.random() * suburbNames.length)]
        const response = await fetch(`${PUBLIC_BASE_URL}/api/suburb/${suburb!.toLowerCase()}.json`)
        const targetSuburb = await response.json()
        
        gameState.init(targetSuburb)

        // goto("/game")

        
    }

    $inspect(gameState.targetSuburb)
</script>

{#if gameState.targetSuburb.name === "null"}
    <div class="text-center">
        <h1>my little game :)</h1>
        <p>press start to play!</p>

        <button onclick={pickRandomSuburb} class="border-2 p-4 px-8 cursor-pointer">
            start
        </button>
        <select class="block" onchange={change} bind:value={value}>
            {#each suburbNames as suburb}
                <option value={suburb}>
                    {suburb}
                </option>
            {/each}
        </select>
    </div>

{:else}
<GamePage/>    
{/if}





