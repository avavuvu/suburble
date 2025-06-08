<script lang="ts">
    import feedManager from "$lib/feedManager.svelte";
    import gameManager from "$lib/gameManager.svelte";
    import capitalize from "$lib/queryUtils/capitalize";
    import suburbNameSearcher from "$lib/queryUtils/fastFuzzy";
    import statusManager from "$lib/statusManager.svelte";
    import { SuburbCache, suburbCache } from "$lib/suburbCache";
    import suburbQuery from "$lib/suburbQuery";
    import type { KeyboardEventHandler } from "svelte/elements";
    import { fly, slide } from "svelte/transition";

    let inputValue = $state("")

    let potentialSuburbs: string[] = $state([])

    let isSelectableSuburbs = $derived(inputValue.length > 2 && potentialSuburbs.length > 0)

    let isSuburbButtonFocused = $state(false)

    let isFormFocused = $state(false)

    let suburbList: HTMLElement | undefined = $state(undefined)
    let formInput: HTMLInputElement | undefined = $state(undefined)

    const inputChanged = async () => {
        const normalizedInput = inputValue.toLowerCase();

        potentialSuburbs = suburbNameSearcher.search(normalizedInput, {
            threshold: .9
        })

        if(potentialSuburbs.length < 8) {
            const cacheSuburbs = potentialSuburbs.map(suburb => suburbCache.get(suburb))

            await Promise.all(cacheSuburbs)
        }

        if(potentialSuburbs.length === 0) {
            const correctionAttempt = suburbNameSearcher.search(normalizedInput, {
                threshold: .7
            })

            if(correctionAttempt) {
                potentialSuburbs = correctionAttempt
            }
        }
    }

    function handleArrowKeys(event: KeyboardEvent) {
        let child: Element | null = null

        if(isFormFocused) {
            child = event.key === "ArrowUp"
                ? suburbList!.lastElementChild
                : suburbList!.firstElementChild

        } else if(isSuburbButtonFocused) {
            const focusedButton = document.querySelector(":focus")

            if(!focusedButton) {
                return
            }

            child = event.key === "ArrowUp"
                ? focusedButton.previousElementSibling
                : focusedButton.nextElementSibling

            // it will be null if there is no previous/next sibling
            // which means we are a the top/end of list and need to loop back around
            if(child === null) {

                child = event.key === "ArrowUp"
                    ? suburbList!.lastElementChild
                    : suburbList!.firstElementChild
            }
        }

        event.preventDefault()

        if(child) {
            ;(child as HTMLElement).focus()
        }

    }

    // focus and selected are different things
    const onkeydown: KeyboardEventHandler<Window> = (event) => {
        if(event.key === "ArrowUp" || event.key === "ArrowDown") {
            handleArrowKeys(event)
        }

        if(event.key === "Backspace" && isSuburbButtonFocused) {
            formInput!.focus()
        }

        if(event.key === "Tab" && isFormFocused && isSelectableSuburbs) {
            const child = suburbList!.firstElementChild

            if(child) {
                event.preventDefault()
                ;(child as HTMLElement).focus()
            }
        }

    }

    const makeGuess = async (suburbName?: string) => {
        let guessString = suburbName || inputValue

        if(guessString === "") {
            statusManager.setStatus({
                type: "empty",
                shake: true
            })
            return
        }

        inputValue = ""

        if(potentialSuburbs.length === 1) {
            guessString = potentialSuburbs[0]
        }
        
        await gameManager.attemptGuess(guessString)
    }



</script>

<svelte:window {onkeydown}></svelte:window>

<div class="relative">

    {#if isSelectableSuburbs}
        <div transition:slide 
            id="suburb-list"
            bind:this={suburbList}
            class="absolute h-48 w-full bottom-14 overflow-scroll p-2
                rounded shadow-2xl text-xl bg-gray-100">
            {#each potentialSuburbs as suburb}
                <button
                    onfocusout={() => isSuburbButtonFocused = false}
                    onfocus={() => isSuburbButtonFocused = true}
                    onclick={async () => await makeGuess(suburb)} 
                    class:only-option={
                        (potentialSuburbs.length === 1
                        || inputValue === suburb.toLowerCase()) && !isSuburbButtonFocused
                    }
                    class="
                        suburb-button
                        block my-1 py-1 bg-white w-full rounded cursor-pointer
                        hover:bg-gray-100 transition-colors 
                        active:bg-gray-300 focus:bg-gray-300
                        [.only-option]:bg-gray-300">
                    {suburb}

                </button>
            {/each}
        </div>
    {/if}

    <form class="grid grid-cols-1 grid-rows-1 border border-black w-full rounded overflow-clip
        focus-within:outline-1 focus-within:outline-blue">
        {#if !gameManager.clueManager.clueStore}
            <div class="col-start-1 col-end-1 row-start-1 row-end-2
                    inline-flex justify-between w-full">
                <input 
                    bind:this={formInput}
                    bind:focused={isFormFocused}
                    bind:value={inputValue}
                    type="text"
                    placeholder={gameManager.gameEnded ? "" : suburbQuery.getPlaceholder()}
                    autocomplete="off"
                    oninput={inputChanged}
                    onsubmit={() => makeGuess()}
                    disabled={gameManager.gameEnded}
                    class="w-full flex-1 px-2 h-10 disabled:bg-gray">
                <button 
                    disabled={gameManager.gameEnded}
                    class=" green px-2"
                    onclick={() => makeGuess()}>Guess!</button>
            </div>
        {:else}
            <div 
                transition:fly
                class="col-start-1 col-end-1 row-start-1 row-end-2
                    inline-flex justify-between w-full">
                <button 
                    placeholder={suburbQuery.getPlaceholder()}
                    oninput={inputChanged}
                    onclick={() => gameManager.clueManager.unloadClue(true)}
                    class="w-full flex-1 px-2 h-10 bg-red-400 text-white">
                    {gameManager.clueManager.clueStore.revealText}
                </button>
                <button 
                    class="text-red-400 bg-white  px-2"
                    onclick={() => gameManager.clueManager.unloadClue(false)}>
                    Skip Clue
                </button>

            </div>
        {/if}
    </form>
</div>