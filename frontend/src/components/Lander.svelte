<script lang="ts">
    import type { Snippet } from "svelte";
    import Marquee from "./Marquee.svelte";
    import { streakManager } from "$lib/streakManager";

    const getStreak = async () => {
        return await streakManager.getStreak()
    }

    const { children }: { children: Snippet} = $props()

</script>

<div class="sticky top-0">
    <a 
        href="https://crossword.blue"
        class="block bg-[#3b8ea3] text-white scale-y-150 origin-top mb-3">
        <Marquee lines={[
            "Like Suburble? Try Crossword Dot Blue!",
            "Like Suburble? Try Crossword Dot Blue!",
            "Like Suburble? Try Crossword Dot Blue!",
            "Like Suburble? Try Crossword Dot Blue!",
        ]}></Marquee>
    </a>

    <a 
        href="/donate"
        class="block bg-correct text-white scale-y-150 origin-top border-b-2 border-b-white">
        <Marquee 
            reverse
            lines={[
            "Support Suburble!",
            "Support Suburble!",
            "Support Suburble!",
            "Support Suburble!",
        ]}></Marquee>
    </a>

</div>

<main class="max-w-[900px] mx-auto">
    <div class="px-4">
        <img src="/assets/logo.svg" alt="Suburble Logo">

    </div>
    
    <p class="text-center italic md:text-xl lg:text-xl">
        The Daily Melbourne Guessing Game
    </p>

    <div class="border-t-2 my-4 border-incorrect"></div>

    <div class="grid px-4 pt-6 place-items-center">
        {#await getStreak()}
            <br>
        {:then streak}
            {#if streak.count === 1}
                <p>You solved {streak.dayDistance === 0 ? "today" : "yesterday"}'s Suburble in {streak.streaks[0].guesses} {streak.streaks[0].guesses === 1 ? "guess" : "guesses"}! 🔥</p>
                {#if streak.dayDistance === 1}
                    <p>Can you solve today's Suburble in {streak.streaks[0].guesses - 1}⁉️</p>
                {/if}
            {:else if streak.count !== 0}
                <p>You're on a {streak.count === 8 ? "an" : "a"} {streak.count} day streak! 🔥</p>
            {:else}
                <br>
            {/if} 
        {/await}
    
        {@render children()}
    </div>

    <div class="border-t-2 my-4 border-incorrect"></div>
</main>

<footer class="max-w-[900px] mx-auto min-h-48 p-4">
    <div class="flex gap-4  justify-stretch align-middle items-center bg-gray-300 rounded p-2 w-fit mx-auto">
        <img src="/assets/favicon.svg" alt="Suburble Logo" class="w-12">
        <ul class="flex gap-2 justify-evenly align-middle items-center">
            
            <li class="bg-incorrect rounded p-2">
                <a href="/about" class=" cursor-pointer">
                    About Suburble
                </a>
            </li>
            <li class="bg-incorrect rounded p-2">
                <a href="/melbourne" class=" cursor-pointer">
                    What counts as "Melbourne"?
                </a>
            </li>
            <li class="bg-incorrect rounded p-2">
                <a href="/donate" class=" cursor-pointer">
                    Donate
                </a>
            </li>
        </ul>

    </div>
</footer>