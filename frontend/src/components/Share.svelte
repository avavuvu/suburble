<script lang="ts">
    import { gameState, type CorrectSuburb } from "$lib/gameState.svelte";


    const { final }: { final: CorrectSuburb } = $props()

    let buttonText = $state("Share!")

    const onclick = () => {
  
        const text = final.didWin 
            ? `I found today's suburb in ${gameState.maxGuesses - final.guessesLeft} guess! https://suburble.melbourne`
            : `I couldn't crack today's Suburble! Can you? https://suburble.melbourne`

        if(window.navigator) {
            if(window.navigator.share) {
                window.navigator.share({
                    text,
                    url: "https://suburble.melbourne"
                })

                return

            }

            buttonText = "Copied to Clipboard"
            window.navigator.clipboard.writeText(text)
        }
    
    }

</script>

<button {onclick} class="bg-white p-2 px-4 rounded">{buttonText}</button>