<script lang="ts">
    import {dev} from '$app/environment';
	import '../app.css';
	import 'maplibre-gl/dist/maplibre-gl.css';
	
	let { children } = $props();

	$effect(() => {
		if(dev) {
			document.title = `DEV ${document.title}`
		}
	})
</script>

{@render children()}

<svelte:head>
	<link rel="icon" href="/assets/favicon.svg" />
</svelte:head>