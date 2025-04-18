<script lang="ts">
    import { goto } from "$app/navigation";
    import { gameState } from "$lib/gameState.svelte";
    import type { Suburb } from "$lib/types";
    import GamePage from "../components/GamePage.svelte";
    import suburbNamesJson from "../json/suburbNames.json"
    const suburbNames = (suburbNamesJson as unknown )as string[]
    import { PUBLIC_API_URL, PUBLIC_BASE_URL } from "$env/static/public";
    import Lander from "../components/Lander.svelte";
    import { read } from "$app/server";
    import { streakManager } from "$lib/streakManager";

    // const pickRandomSuburb = async () => {
    //     const suburb = suburbNames[Math.floor(Math.random() * suburbNames.length)]
    //     const response = await fetch(`${PUBLIC_BASE_URL}/api/suburb/${suburb!.toLowerCase()}.json`)
    //     const targetSuburb = await response.json()
        
    //     gameState.init(targetSuburb)
    // }

    type APIResponse = {
        suburb: string,
        date: string
    }

    const getTodaysSuburb = async () => {
        const response = await fetch(`${PUBLIC_API_URL}/today`)
        const today: APIResponse = await response.json()

        const suburbResponse = await fetch(`${PUBLIC_BASE_URL}/api/suburb/${today.suburb!.toLowerCase()}.json`)
        const targetSuburb: Suburb = await suburbResponse.json()

        return {suburb: targetSuburb, date: today.date}
    }

    const start = (suburb: Suburb, dateKey: string) => {
        gameState.init(suburb, dateKey)
    }
</script>

<svelte:head>
    <title>Suburble</title>
</svelte:head>

{#if gameState.targetSuburb.name === "null"}
    <Lander>
        {#await getTodaysSuburb()}
            <div class="block group  cursor-pointer bg-gray-300 rounded-xl w-[230px] lg:w-[400px]">
                <h1 class="text-center underline text-3xl">
                    <span class="font-bold">
                        Play
                    </span>
                    <span>
                        Daily
                    </span>
                </h1>
                <div class="aspect-square  overflow-clip bg-incorrect m-2 rounded">
                    <img class="group-hover:scale-105 transition-transform " alt="" src="/assets/map.svg">
                </div>
            </div>
        {:then {suburb, date}}
            <button onclick={() => start(suburb, date)} class="block group  cursor-pointer bg-gray-300 rounded-xl w-[230px] lg:w-[400px]">
                <h1 class="text-center underline text-3xl">
                    <span class="font-bold">
                        Play
                    </span>
                    <span>
                        {#await streakManager.hasPlayedToday(date)}
                            Daily
                        {:then hasPlayed} 
                            {#if hasPlayed}
                                Again
                            {:else}
                                Daily
                            {/if}
                        {/await}
                        
                    </span>
                </h1>
                <div class="aspect-square  overflow-clip bg-incorrect m-2 rounded">
                    <img class="group-hover:scale-105 transition-transform " alt="" src="/assets/map.svg">
                </div>
            </button>
        {:catch e}
            <div class="block group  cursor-pointer bg-gray-300 rounded-xl w-[230px] lg:w-[400px]">
                <h1 class="text-center underline text-3xl">
                    <span class="font-bold text-red-500">
                        Error
                    </span>
                </h1>
                <div class="aspect-square  overflow-clip bg-incorrect m-2 rounded border-2 border-black p-2">
                    <p>An error has occured. Please contact the webmaster.</p>
                    <p class="text-gray-400 italic">{e}</p>
                </div>
            </div>
        {/await}
    </Lander>
{:else}
    <GamePage/>    
{/if}





