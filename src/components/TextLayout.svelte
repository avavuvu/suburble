<script lang="ts">
    import type { Snippet } from "svelte";

    const { children }: { children: Snippet } = $props()
</script>

<header class=" h-18 bg-incorrect border-b-2 border-correct">
    <div class="flex h-full max-w-[1200px] mx-auto">
        <a href="/" class=" h-full p-2 cursor-pointer">
            <img class="w-full h-full" src="/assets/favicon.svg" alt="">
    
        </a>

    </div>
</header>

<main class="max-w-[900px] mx-auto py-12">

    <div class="max-w-[65ch] mx-auto">
        {@render children()}
    </div>
</main>
