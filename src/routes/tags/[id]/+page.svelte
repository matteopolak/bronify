<script lang="ts">
	import { page } from '$app/state';
	import Collection from '$lib/components/collection.svelte';
	import { trackData, categoryData, categoryCover } from '$lib/get';
	import { player } from '$lib/player.svelte';

	let title = $derived(categoryData[page.params.id] ?? '');
	let tracks = $derived(trackData.filter((s) => s.tags.includes(page.params.id)));

	$effect(() => {
		player.queue = tracks;
	});
</script>

<Collection
	content={{
		id: page.params.id,
		title: title,
		subtitle: '',
		cover: categoryCover(page.params.id),
		tracks,
		type: 'tag'
	}}
/>
