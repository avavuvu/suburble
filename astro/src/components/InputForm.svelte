<script>
    import statusManager from "@lib/statusManager.svelte.ts";
    import Input from "./Input.svelte";
    import Status from "./Status.svelte";

    let shake = $state(false);

    statusManager.status.subscribe((statusItem) => {
        if (statusItem?.shake) {
            shake = true;

            setTimeout(() => {
                shake = false;
            }, 200);
        }
    });
</script>

<div class:shake>
    <hr class="my-2" />

    <Status />

    <Input />
</div>

<style>
    .shake {
        animation: shake 0.2s ease-in-out 0s 2;
    }

    @keyframes shake {
        0% {
            margin-left: 0rem;
        }
        25% {
            margin-left: 0.5rem;
        }
        75% {
            margin-left: -0.5rem;
        }
        100% {
            margin-left: 0rem;
        }
    }
</style>
