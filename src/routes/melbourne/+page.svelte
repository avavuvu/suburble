<script>
    import TextLayout from "../../components/TextLayout.svelte";

</script>


<TextLayout>
    <h1 class="font-bold text-2xl">What counts as Melbourne?</h1>
    <br>
    <p class="c0"><span class="c5"></span></p>
    <p class="c4">
        <span
            >Melbourne is a sprawling city. It completely engulfs more populated
            cities like
        </span> <span class="c1"
            > <a
                class="c2"
                href="https://mapfight.xyz/map/melbourne/#london"
                > London </a
            > </span
        ><span>, </span> <span class="c1"
            > <a
                class="c2"
                href="https://mapfight.xyz/map/melbourne/#bangkok"
                > Bangkok </a
            > </span
        ><span>, or </span> <span class="c1"
            > <a
                class="c2"
                href="https://mapfight.xyz/map/melbourne/#istanbul"
                > Istanbul </a
            > </span
        ><span
            > &nbsp;when overlaid on top of eachother. And unlike cities like London,
            there is no clear boundary of where Melbourne ends and regional Victoria
            begins. For the purposes of Suburble, I have arbitrarily defined a
            suburb as being part of Melbourne proper it 
        </span>
        <span class="font-bold"> is within 3.5km of an electric train line.</span
        >
    </p>
    <br>
    <p>
        <span class="c5">
            Some areas that are considered part of &ldquo;Greater
            Melbourne&rdquo; like the Mornington Peninsula, and Melton are not
            included as part of this game. This decision is less of a statement
            about Melbourne and more about game design, as guesses in Suburble are
            based in part on train lines.
        </span>
    </p>

</TextLayout>

<style>
    a {
        cursor: pointer;
        text-decoration: underline;
    }

    p {
        max-width: 65ch;
    }
</style>