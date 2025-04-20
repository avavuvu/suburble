<script lang="ts">
    import { gameState, type Guess } from "$lib/gameState.svelte";
    import GuessListItem from "./GuessListItem.svelte";
    import FinalSuburb from "./FinalSuburb.svelte";

    import suburbNamesJson from "../json/suburbNames.json"
    import { suburbCache } from "$lib/suburbCache";
    import DesktopInput from "./DesktopInput.svelte";
    import { SuburbQuery } from "$lib/suburbQuery";
    import MobileInput from "./MobileInput.svelte";
    import { dev } from "$app/environment";
    import { UAParser } from "ua-parser-js";

    const { device } = UAParser(window.navigator.userAgent)
    const isDesktop = device.type === undefined || !['wearable', 'mobile'].includes(device.type);

    const suburbNames = (suburbNamesJson as unknown )as string[]

    const suburbQuery = new SuburbQuery(suburbNames)

    let guessList!: HTMLElement

    const attemptGuess = async (suburbName: string | null): Promise<boolean> => {
        // guess invalid
        if(suburbName === null) {
            return false
        }

        const normalizedInput = suburbName.toLowerCase()

        const isSuburb = suburbQuery.findSuburb(normalizedInput)

        if (!isSuburb) { 
            gameState.setHelpText( {
                type: "Error",
                errorType: "Not a Suburb",
                suburbName: `${suburbName.slice(0, 1).toUpperCase()}${suburbName.slice(1)}`
            })

            return false 
        }

        const suburb = (await suburbCache.get(suburbName))!

        const previouslyGuessed = gameState.guesses.has(suburbName.toLowerCase())
        if(previouslyGuessed) {
            gameState.setHelpText( {
                type: "Error",
                errorType: "Already Guessed",
                suburbName: `${suburbName.slice(0, 1).toUpperCase()}${suburbName.slice(1)}`
            })
            return false
        }

        gameState.addGuess(suburb)

        return true
    }


    const scrollToBottom = () => {
        guessList.scrollTo({
                "top": 10000,
                "behavior": "smooth"
            })
    }

    let giveUpStatus = $state(0)
    const incrementGiveUp = () => {
        if(giveUpStatus === 0) {
            giveUpStatus ++
        }else {
            gameState.giveUp()
        }
    }

    let expanded = $state(false)

    gameState.on("gameEnded", () => {
        expanded = true
    })

</script>



<div class="fixed bottom-12 w-full">
    <div class="w-[90vw] mx-auto flex justify-between m-1 ">
        {#if gameState.guesses.size > 2 || gameState.gameState === "ended"}
        <button class="cursor-pointer block  p-2  border-incorrect border-4 rounded-xl bg-white"
            onclick={() => expanded = !expanded}> 
            {#if expanded}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
            {/if}
        </button>
        {/if}

        {#if (gameState.guessesLeft < 5 && gameState.gameState === "playing") || dev }
            <button class="cursor-pointer block  p-2  border-incorrect border-4 rounded-xl"
                style:background-color={giveUpStatus === 0 ? "var(--color-white)" : "var(--color-red-400)"} 
                style:color={giveUpStatus === 0 ? "var(--color-black)" : "var(--color-white)"} 
                onclick={incrementGiveUp}> 
                {#if giveUpStatus === 0}
                    give up
                {:else}
                    are you sure?
                {/if}
            </button>
        {/if}
        
    </div>


    <div class="bg-white w-[90vw] mx-auto rounded-xl p-2">
            <div>
                <ul id="guess-list" class:expanded bind:this={guessList} class="overflow-scroll flex flex-col gap-4 lg:gap-2">
                    {#each gameState.guesses as [_, guess]}
                        {#if guess.type === "guess"}
                            <GuessListItem { guess } {scrollToBottom}></GuessListItem>
                            
                        {:else}
                            <FinalSuburb final={guess} {scrollToBottom}></FinalSuburb>
                        {/if}
                    {/each}
                </ul>
            </div>

            {#if gameState.gameState === "playing"}

                <div class="flex justify-between py-2">
                    <p id="help-text" class="italic px-2 min-h-12 lg:min-h-6 md:min-h-6 line-clamp-2 lg:line-clamp-1 md:line-clamp-1">{gameState.helpText}</p> 
                </div>

                {#if isDesktop}
                    <DesktopInput {suburbQuery} {attemptGuess}/>
                {:else}
                    <MobileInput {suburbQuery} { attemptGuess}></MobileInput>
                {/if}
            {/if}

    </div>

</div>

<style>
    #guess-list {
        transition: all;
        transition-duration: 500ms;
        max-height: 12rem;
    }

    #guess-list.expanded {
        max-height: 80vh;
    }

</style>