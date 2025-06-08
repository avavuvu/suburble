<script lang="ts">
    import gameManager from "$lib/gameManager.svelte";
    import { slide } from "svelte/transition";


</script>

<div class="w-[90%] mx-auto h-6" >
    {#if gameManager.guesses.size > 2 && !gameManager.gameEnded}
        

        <svg 
            transition:slide
            width="100%" height="100%" 
            viewBox="0 0 {gameManager.maxGuesses} 1">
            {#each {length: gameManager.maxGuesses}, index }
                <g transform={`translate(${index}, 0)`}>
                    <circle 
                        cx={0.5} 
                        cy={0.5} 
                        r={0.4} 
                        class:shake={gameManager.guesses.size > gameManager.maxGuesses - 2}
                        class:green-circle={index < gameManager.guesses.size}
                        class:yellow-circle={index < gameManager.guesses.size && index === gameManager.maxGuesses - 2}
                        class:red-circle={index < gameManager.guesses.size && index === gameManager.maxGuesses - 1}
                        stroke="white"
                        stroke-width="0.08"
                        style:animation-delay="{100 * index}ms"
                    />

                </g>
            {/each}
        </svg>
    {/if}

</div>

<style>
    circle.green-circle {
        fill: var(--color-green);
    }
    circle.yellow-circle {
        fill: var(--color-yellow);
    }
    circle.red-circle {
        fill: var(--color-red);
    }

    .shake {
        animation: shake .5s infinite;
    }

    @keyframes shake {
    0%, 100% { transform: translateY(0); }
    20%, 60% { transform: translateY(-0.002rem); }
    40%, 80% { transform: translateY(0.002rem); }
}
</style>