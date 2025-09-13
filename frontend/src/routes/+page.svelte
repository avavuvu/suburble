<script lang="ts">
    import Lander from "../components/Lander.svelte";
    import { dev } from "$app/environment";
    import { streakManager } from "$lib/streakManager";

    const formatDate = (date: Date) => 
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
</script>

<svelte:head>
    <title>Suburble</title>
</svelte:head>

<Lander>

    {#if dev}
        <a 
            class="block group cursor-pointer bg-white border rounded-xl w-[230px] lg:w-[400px] text-center m-12 p-4"
            href="/game?random" data-sveltekit-reload >
            play random suburb
        </a>
    {/if}

    <a href="/game" data-sveltekit-reload class="block group cursor-pointer bg-gray border rounded-xl w-[230px] lg:w-[400px]">
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





