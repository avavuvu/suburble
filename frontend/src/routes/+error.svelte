<script lang="ts">
    import TextLayout from '@/TextLayout.svelte';
    import { error } from '@sveltejs/kit';
    import { page } from '$app/state';

</script>

<TextLayout>
    <h1>Error! {page.status}</h1>
    
    <p class="text-gray-600">An error occured: {page.error?.message}</p>
    <p>
        <a class="link" href="mailto:avadinhvu@gmail.com">Contact Ava</a>
    </p>
</TextLayout>

