<script lang="ts">
    import suburbNamesJson from "../json/suburbNames.json"
    const suburbNames = (suburbNamesJson as unknown ) as string[]
    import { PUBLIC_API_URL, PUBLIC_BASE_URL } from "$env/static/public";

    import Lander from "../components/Lander.svelte";
    import { dev } from "$app/environment";
    import { SuburbCache, suburbCache } from "$lib/suburbCache";
    import type { Suburb } from "@t/suburb";
    import { goto } from "$app/navigation";
    import { streakManager } from "$lib/streakManager";

    const start = () => {
        goto("/game", {

        })
    }

    const formatDate = (date: Date) => 
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
</script>

<svelte:head>
    <title>Suburble</title>
</svelte:head>

<Lander>
    <!-- {#if dev}
        <button class="active:bg-black" onclick={pickRandomSuburb}>play random suburb</button>
        {error}
    {/if} -->

    <a href="/game" data-sveltekit-reload class="block group  cursor-pointer bg-gray border rounded-xl w-[230px] lg:w-[400px]">
        <h1 class="text-center underline text-3xl">
            <span class="font-bold">
                Play
            </span>
            <span>
                {#await streakManager.hasPlayedToday(formatDate(new Date()))}
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
        <div class="aspect-square  overflow-clip bg-white border m-2 rounded">
            <img class="group-hover:scale-105 transition-transform " alt="" src="/assets/map.svg">
        </div>
    </a>
</Lander>





