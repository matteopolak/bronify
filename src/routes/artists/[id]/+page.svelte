<script lang="ts">
	import { page } from '$app/state';
	import Collection from '$lib/components/collection.svelte';
	import { artistThumbnail, getArtist, trackData } from '$lib/get';
	import { player } from '$lib/player.svelte';

	let artist = $derived(getArtist(page.params.id));
	let tracks = $derived(trackData.filter((s) => s.artist === artist.id));

	$effect(() => {
		player.queue = tracks;
	});
</script>

<Collection
	content={{
		id: artist.id,
		title: artist.id,
		subtitle: 'Artist',
		cover: artistThumbnail(artist.id),
		tracks,
		type: 'artist'
	}}
/>
