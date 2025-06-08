<script lang="ts">
    import { goto } from "$app/navigation";
    import { PUBLIC_API_URL, PUBLIC_BASE_URL } from "$env/static/public";
    import gameManager from "$lib/gameManager.svelte";
    import { SuburbCache, suburbCache } from "$lib/suburbCache";
    import suburbQuery from "$lib/suburbQuery";
    import Feed from "@/Feed.svelte";
    import InputForm from "@/InputForm.svelte";
    import Map from "@/Map.svelte";
    import ParCounter from "@/ParCounter.svelte";
    import suburbNamesJson from "@j/suburbNames.json"
    import type { Suburb } from "@t/suburb";
    import { onMount } from "svelte";
    const suburbNames = suburbNamesJson as string[]

    suburbQuery.init(suburbNames)

    let error: {
        error: boolean,
        reason?: string
    } = $state({
        error: false,
    })

    async function startGame() {
        try {
            const {suburb, date} = await getTodaysSuburb()
            
            await gameManager.init(suburb.suburb, date)
        }
        catch(e) {
            error.error = true
            error.reason = String(e)
        }
    }

    type APIResponse = {
        suburb: string,
        date: string
    }
    
    const getTodaysSuburb = async () => {
        const response = await fetch(`${PUBLIC_API_URL}/today`)
        const today: APIResponse = await response.json()

        const suburbResponse = await fetch(`${PUBLIC_BASE_URL}/api/suburb/${SuburbCache.normalizeSuburbName(today.suburb!)}.json`)
        const targetSuburb: {ok: boolean, suburb: Suburb} = await suburbResponse.json()

        return {suburb: targetSuburb, date: today.date}
    }

</script>

{#if !error.error}
    <div class="">
        {#await startGame()}
            <!-- loading... -->
        {:then _}

        <div class="relative h-screen" class:expanded={gameManager.expanded}>
            <div id="map" class="h-[calc(100%-15vh)]">
                <Map />
            </div>
        
            <div id="feed" class="absolute bottom-[15vh] left-0 right-0">

                <ParCounter/>
                <button class="block p-2 border rounded-lg right-5 absolute -top-6 bg-white"
                onclick={() => gameManager.expanded = !gameManager.expanded}> 
                    {#if gameManager.expanded}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                    {/if}
                </button>
                
                <Feed/>
            </div>
        
            <div id="input" class="w-full">
                <div class="w-[90vw] max-w-[600px] mx-auto grid items-start">
                    <InputForm />
                </div>
            </div>
        </div>
        {/await}
    </div>
{:else}
<main class="flex justify-center place-items-center h-screen">
    <div class="block group bg-gray rounded-xl w-[230px] lg:w-[400px] border">
        <a data-sveltekit-reload  href="/">

            <img src="/assets/logo.svg" alt="Suburble Logo" class="w-24 mx-auto">
        </a>

        <div class="aspect-square text-center overflow-clip bg-incorrect m-2 rounded border border-black p-2 bg-white">
            <h1 class="text-center underline text-3xl">
                <span class="font-bold text-red">
                    Error :/
                </span>
            </h1>
            <p>
                <a data-sveltekit-reload class="link" href="/game"> Click here to reload the page</a>
            </p>
            <p class="text-gray-400 italic">{error.reason}</p>

        </div>
    </div>

</main>
{/if}

<style>

</style>