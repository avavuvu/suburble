<script lang="ts">
    import { SuburbCache, suburbCache } from "@lib/suburbCache";
    import suburbQuery from "@lib/suburbQuery";
    import gameManager from "@lib/gameManager.svelte.ts";
    import Feed from "./Feed.svelte";
    import InputForm from "./InputForm.svelte";
    import Map from "./Map.svelte";
    import ParCounter from "./ParCounter.svelte";
    import StartDialog from "./StartDialog.svelte";
    import suburbNamesJson from "@j/suburbNames.json";
    import type { Suburb } from "@t/suburb";

    const {
        suburb,
        date,
    }: {
        suburb: Suburb;
        date: string;
    } = $props();

    const suburbNames = suburbNamesJson as string[];

    const urlParams = new URLSearchParams(window.location.search);
    const useRandomSuburb = urlParams.has("random") && import.meta.env.DEV;

    let open = $state(true);

    suburbQuery.init(suburbNames);

    let error: {
        error: boolean;
        reason?: string;
    } = $state({
        error: false,
    });

    async function startGame() {
        try {
            // for debugging / for my fun

            if (useRandomSuburb) {
                const suburb = await fetch(
                    `/api/suburb/${SuburbCache.normalizeSuburbName(suburbQuery.randomSuburb())}.json`,
                );
                const response = await suburb.json();
                await gameManager.init(response.suburb, "2024-10-10");
                return;
            }

            // otherwise

            await gameManager.init(suburb, date);
        } catch (e) {
            error.error = true;
            error.reason = String(e);
        }
    }
</script>

<StartDialog bind:open></StartDialog>

{#if !error.error}
    <main class="">
        {#await startGame()}
            <!-- loading... -->
        {:then _}
            <div class="relative game" class:expanded={gameManager.expanded}>
                <div id="map" class="h-[calc(100%-15vh)]">
                    <Map />
                </div>

                <div id="feed" class="absolute bottom-[15vh] left-0 right-0">
                    <ParCounter />
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                        class="block p-2 border rounded-lg right-18 absolute -top-6 bg-white"
                        onclick={() => (open = true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-info-icon lucide-info"
                            ><circle cx="12" cy="12" r="10" /><path
                                d="M12 16v-4"
                            /><path d="M12 8h.01" /></svg
                        >
                    </button>
                    <button
                        class="block p-2 border rounded-lg right-5 absolute -top-6 bg-white"
                        onclick={() =>
                            (gameManager.expanded = !gameManager.expanded)}
                    >
                        {#if gameManager.expanded}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-chevron-down-icon lucide-chevron-down"
                                ><path d="m6 9 6 6 6-6" /></svg
                            >
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-chevron-up-icon lucide-chevron-up"
                                ><path d="m18 15-6-6-6 6" /></svg
                            >
                        {/if}
                    </button>

                    <Feed />
                </div>

                <div id="input" class="w-full">
                    <div
                        class="w-[90vw] max-w-[600px] mx-auto grid items-start"
                    >
                        <InputForm />
                    </div>
                </div>
            </div>
        {/await}
    </main>
{:else}
    <main class="flex justify-center place-items-center h-screen">
        <div
            class="block group bg-gray rounded-xl w-[230px] lg:w-[400px] border"
        >
            <a href="/">
                <img
                    src="/assets/logo.svg"
                    alt="Suburble Logo"
                    class="w-24 mx-auto"
                />
            </a>

            <div
                class="aspect-square text-center overflow-clip bg-incorrect m-2 rounded border border-black p-2 bg-white"
            >
                <h1 class="text-center underline text-3xl">
                    <span class="font-bold text-red"> Error :/ </span>
                </h1>
                <p>
                    <a class="link" href="/game">
                        Click here to reload the page</a
                    >
                </p>
                <p class="text-gray-400 italic">{error.reason}</p>
            </div>
        </div>
    </main>
{/if}

<style>
    .game {
        height: 100dvh;
        height: 100svh;
    }
</style>
