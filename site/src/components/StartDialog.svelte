<script lang="ts">
    let { open = $bindable(false) }: { open: boolean } = $props();

    let dialog!: HTMLDialogElement;

    $effect(() => {
        dialog.showModal();
        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    });
</script>

<dialog
    bind:this={dialog}
    class="z-10 p-0 rounded-lg shadow-xl mx-auto my-auto"
>
    <div class="bg-white p-6 min-w-[300px]">
        <h1 class="text-xl font-bold mb-4">How To Play</h1>
        <p class="mb-4">
            Type any Melbourne suburb, and use the hints to triangulate the mystery suburb.
        </p>

        <div class="p-4 pb-0 ">
            <img class="max-w-56 mx-auto" src="/assets/logo.svg" alt="Suburble Logo">

        </div>

        <button
            onclick={() => (open = !open)}
            class="max-w-30 mx-auto block my-4 px-4 py-2 rounded border border-black hover:bg-gray active:bg-green active:text-white">
            Let's Play!
        </button>
    </div>
</dialog>

<style>
    .mystery-fill {
        fill: var(--color-green);
        opacity: 50%;
        stroke: var(--color-green);
        stroke-dasharray: 3;
        stroke-miterlimit: 10;
        stroke-width: 2px;
    }

    .mystery-stroke {
        fill: none;
        stroke: var(--color-green);
        stroke-dasharray: 3;
        stroke-miterlimit: 10;
        stroke-width: 2px;
    }
</style>
