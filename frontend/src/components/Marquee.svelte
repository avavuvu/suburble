<script lang="ts">

    const { lines, reverse }: {
        lines: string[],
        reverse?: boolean
    } = $props()

</script>

<div class="marquee" >
    <ul 
        style:animation-direction={reverse ? "reverse" : ""}
        class="marquee-content">
        {#each lines as line}
            <li>{line}</li>  
        {/each}
    </ul> 
    <ul 
        style:animation-direction={reverse ? "reverse" : ""}
        class="marquee-content" 
        aria-hidden="true">
        {#each lines as line}
            <li>{line}</li>  
        {/each}

    </ul>
</div>


<style inline>

.marquee {
        margin: 0px;
        --gap: 1rem;
        display: flex;
        overflow: hidden;
        user-select: none;
        gap: var(--gap);
        mask-image: linear-gradient(
            to right,
            transparent,
            black 1%,
            black 99%,
            transparent
        );
        -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 1%,
            black 99%,
            transparent
        );
    }
    
    .marquee-content {
        list-style-type: "";

        will-change: transform;
        transform: translate3d(0, 0, 0);
        
        margin: 0px;
        flex-shrink: 0;
        display: flex;
        justify-content: space-around;
        min-width: 100%;
        gap: var(--gap);
        animation: scroll 45s linear -30s infinite;
    }

    li {
        transform-origin: 50% 0%; /* center horizontally, top vertically */
    }

    @keyframes scroll {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(calc(-100% - var(--gap)));
        }
    }

</style>