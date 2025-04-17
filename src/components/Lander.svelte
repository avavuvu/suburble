<script lang="ts">
    import Marquee from "./Marquee.svelte";

    const { start }: { start: () => void } = $props()

</script>

<div class="sticky top-0">
    <a 
        href="https://crossword.blue"
        class="block bg-[blue] text-white scale-y-150 origin-top mb-3">
        <Marquee lines={[
            "Like Suburble? Try Crossword Dot Blue!",
            "Like Suburble? Try Crossword Dot Blue!",
            "Like Suburble? Try Crossword Dot Blue!",
            "Like Suburble? Try Crossword Dot Blue!",
        ]}></Marquee>
    </a>

    <div class="bg-correct text-white scale-y-150 origin-top border-b-2 border-b-white">
        <Marquee 
            reverse
            lines={[
            "Support Suburble!",
            "Support Suburble!",
            "Support Suburble!",
            "Support Suburble!",
        ]}></Marquee>
    </div>

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
        <button onclick={start} class="block group  cursor-pointer bg-gray-300 rounded-xl w-[230px] lg:w-[400px]">
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
        </button>
    </div>

    <div class="border-t-2 my-4 border-incorrect"></div>
</main>



<footer class="max-w-[900px] mx-auto min-h-48 p-4">
    <ul class="flex gap-4 flex-wrap  justify-stretch align-middle items-center bg-gray-300 rounded p-2 w-fit mx-auto mx-">
        <li> <img src="/assets/favicon.svg" class="min-w-12">  </li>
        <li class="bg-incorrect rounded p-2">
            <a class=" cursor-pointer">
                About Suburble
            </a>
        </li>
        <li class="bg-incorrect rounded p-2">
            <a href="/melbourne" class=" cursor-pointer">
                What counts as "Melbourne"?
            </a>
        </li>
        <!-- <li class="bg-incorrect rounded p-2">
            <a class=" cursor-pointer">
                Donate
            </a>
        </li> -->
    </ul>
</footer>