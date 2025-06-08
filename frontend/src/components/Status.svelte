<script lang="ts">
    import gameManager from "$lib/gameManager.svelte";
    import capitalize from "$lib/queryUtils/capitalize";
    import statusManager from "$lib/statusManager.svelte";

    const { status } = statusManager

    let animateIn = $state(false)
    status.subscribe((_) => {
        animateIn = true

        setTimeout(() => {
            animateIn = false
        }, 2000)
    })
</script>

<p class:animate-in={animateIn}>
    {#if $status?.type === "did you mean"}
        Did you mean 
        <button 
            class="underline text-blue-600 cursor-pointer"
            onclick={() => gameManager.attemptGuess($status.suburbName)}>

            {capitalize($status.suburbName)}
        </button>?
        
    {:else if $status?.type === "not found"}
        "<span class="font-bold">{capitalize($status.notFoundName)}</span>" is not in the suburb database
    
    {:else if $status?.type === "empty"}
        Enter a suburb name
    {:else if $status?.type === "already guessed"}
        "<span class="font-bold">{capitalize($status.alreadyGuessedName)}</span>" has already been guessed
    {:else if $status?.type === "guess"}
        {#if $status.bestGuess.directionInfo.distanceToTarget > $status.guess.directionInfo.distanceToTarget}
            <span class="font-bold">{capitalize($status.suburbName)}</span> is warmer!
        {:else if $status.bestGuess.directionInfo.distanceToTarget < $status.guess.directionInfo.distanceToTarget}
            <span class="font-bold">{capitalize($status.suburbName)}</span> is cooler!
        {:else}
            <span class="font-bold">{capitalize($status.suburbName)}</span> is {$status.guess.directionInfo.distanceToTarget.toFixed(2)}km from the mystery suburb
        {/if}
    {:else if $status?.type === "start"}
        <span class="italic">Type any Melbourne suburb</span>
    {/if}
</p>

<style>
    .animate-in {
        animation: animate-in 0.2s ease-in forwards;

    }

    @keyframes animate-in {
        0% {
            transform: translateY(100%);
            opacity: 0;
        }
        100% {
            transform: translateY(0%);
            opacity: 100%;
        }
    }
    
</style>