<script lang="ts">
    import type { Snippet } from "svelte";
    import Marquee from "./Marquee.svelte";
    import { streakManager } from "@lib/streakManager";

    const getStreak = async () => {
        return await streakManager.getStreak();
    };

    const { children }: { children: Snippet } = $props();
</script>

<div class="sticky top-0">
    <a
        href="https://crossword.blue"
        class="block bg-red text-white scale-y-150 origin-top mb-3 h-6"
    >
        <Marquee
            lines={[
                "Like Suburble? Try Crossword Dot Blue!",
                "Like Suburble? Try Crossword Dot Blue!",
                "Like Suburble? Try Crossword Dot Blue!",
                "Like Suburble? Try Crossword Dot Blue!",
            ]}
        ></Marquee>
    </a>

    <a
        href="/donate"
        class="block bg-green text-white scale-y-150 origin-top border-b border-b-black h-6"
    >
        <Marquee
            reverse
            lines={[
                "Support Suburble!",
                "Support Suburble!",
                "Support Suburble!",
                "Support Suburble!",
            ]}
        ></Marquee>
    </a>
</div>

<main class="max-w-[900px] mx-auto">
    <div class="p-4 pb-0">
        <img
            class="max-w-56 mx-auto"
            src="/assets/logo.svg"
            alt="Suburble Logo"
        />
    </div>

    <p class="text-center italic md:text-xl lg:text-xl">
        The Daily Melbourne Guessing Game
    </p>

    <div class="border-t my-4 border-black"></div>

    <div class="grid px-4 place-items-center">
        <div class="max-w-48 text-center">
            {#await getStreak()}
                <br />
            {:then streak}
                {#if streak.count === 1}
                    <p>
                        You solved {streak.dayDistance === 0
                            ? "today"
                            : "yesterday"}'s Suburble in {streak.streaks[0]
                            .guesses + 1}
                        {streak.streaks[0].guesses + 1 === 1
                            ? "guess"
                            : "guesses"}! 🔥
                    </p>
                    {#if streak.dayDistance === 1}
                        <p>
                            Can you solve today's Suburble in {streak.streaks[0]
                                .guesses - 1}⁉️
                        </p>
                    {/if}
                {:else if streak.count !== 0}
                    <p>
                        You're on a {streak.count === 8 ? "an" : "a"}
                        {streak.count} day streak! 🔥
                    </p>
                {:else}
                    <br />
                {/if}
            {/await}
        </div>

        {@render children()}
    </div>

    <div class="border-t my-4 border-black"></div>
</main>

<footer class="max-w-[900px] mx-auto min-h-48 p-4">
    <div
        class="flex gap-2 justify-center align-middle items-center bg-gray border rounded p-2 w-fit mx-auto"
    >
        <img src="/assets/favicon.svg" alt="Suburble Logo" class="w-12" />
        <ul class="flex flex-col gap-2 justify-evenly align-middle">
            <a href="/about" class="bg-white border rounded p-2 cursor-pointer">
                About Suburble
            </a>
            <a
                href="/melbourne"
                class="bg-white border rounded p-2 cursor-pointer"
            >
                What counts as 'Melbourne'?
            </a>
            <a
                href="/donate"
                class="bg-white border rounded p-2 cursor-pointer"
            >
                Donate
            </a>
        </ul>
    </div>
</footer>
