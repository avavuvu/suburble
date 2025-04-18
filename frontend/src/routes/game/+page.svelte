<script>
    import { goto } from "$app/navigation";
    import { gameState } from "$lib/gameState.svelte";
    import GamePage from "../../components/GamePage.svelte";

    if(gameState.targetSuburb.name === "null") {
        goto("/")
    }
</script>

