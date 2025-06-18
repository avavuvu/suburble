<script lang="ts">
    import { goto } from "$app/navigation";
    import type { FeedReveal } from "@t/feed";


    const { feedItem }: { feedItem: FeedReveal } = $props()
    const { didWin, guesses } = feedItem.revealData

    let buttonText = $state("Share!")

    const onclick = () => {
  
        let text = didWin 
            ? `I found today's Suburb in ${guesses} guess${guesses === 1 ? "" : "es"}!`
            : `I couldn't crack today's Suburble! Can you?`

        text += ` https://suburble.melbourne`;

        if(window.navigator) {
            if(window.navigator.share) {
                window.navigator.share({
                    text,
                })

            } else {
                buttonText = "Copied to Clipboard"
                window.navigator.clipboard.writeText(text)

            }

        }
    
    }

</script>

<div class="flex gap-2">
    <button {onclick} 
        class:shared={buttonText === "Copied to Clipboard"}
        class="share
        bg-white p-2 px-4 rounded border-1 border-black">{buttonText}</button>
    
    <button onclick={() => goto("/")}
        class="home
        bg-white p-2 px-4 rounded border-1 border-black">Home</button>

</div>

<style>
    .home:hover {
        background-color: var(--color-gray);  
    }

    .home:active {
        background-color: var(--color-black);
        color: var(--color-white);
    }

    .share:hover {
        background-color: var(--color-gray);  
    }

    .share:active {
        background-color: var(--color-black);
        color: var(--color-white);
    }

    .share.shared:hover {
        background-color: var(--color-white);  
    }

    .share.shared:active {
        background-color: var(--color-white);
        color: var(--color-black);
    }
</style>