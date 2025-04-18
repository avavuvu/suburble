<script lang="ts">
    import TextLayout from "../../components/TextLayout.svelte";


</script>

<svelte:head>
    <title>About – Suburble</title>
</svelte:head>

<TextLayout>
    <h1 class="font-bold text-2xl">About Suburble</h1>
    <br>

    <p>
        Suburble is a game about guessing Melbourne suburbs. I made Suburble for my friend Ria. She likes this game called <a class="link" href="https://trainle.fun">Trainle</a>, itself a game about guessing Melbourne train stations.
    </p>
    <p>
        It might seem like a big undertaking to make a game for a birthday, but anyone who knows Ria will understand. Within 30 minutes of meeting Ria, people start moving heaven and earth for her. She is so unbelievably funny and charismatic, so kind and generous. She very tragically moved to Canberra a few years ago (boo), but is now back in Melbourne (yay), and I feel so lucky to have her in my life. 
    </p>

    <p class="italic">If you like Suburble, and would like to have a chat or give me a job, 
        <a class="link" href="mailto:avadinhvu@gmail.com">send me an email.</a>
    </p>

    <h2 class="font-bold">Legal</h2>
    <p>
        This game uses geographic data from Open Street Maps. Etymology comes from <a class="link" href="https://maps.philipmallis.com/melbourne-suburb-names-etymology/">VicNames via the amazing Philip Mallis.</a> Housing prices come from the<a class="link" href="https://www.land.vic.gov.au/valuations/resources-and-reports/property-sales-statistics"> Victorian government.</a> Population comes from the census via Wikidata. All images are public domain unless otherwise stated. 
    </p>

    <h2 class="font-bold">Technical</h2>
    <p>
        This website was build using SvelteKit. The map is made with MapLibreGL. 
    </p>
    
</TextLayout>

<style>
    p {
        padding-bottom: 1rem;
    }
</style>