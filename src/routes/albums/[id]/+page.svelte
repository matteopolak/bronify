<script lang="ts">
	import { page } from '$app/state';
	import Collection from '$lib/components/collection.svelte';
	import { albumCover, trackData, getAlbum } from '$lib/get';
	import { player } from '$lib/player.svelte';

	let album = $derived(getAlbum(page.params.id));
	let tracks = $derived(trackData.filter((s) => album.trackIds.includes(s.id)));

	$effect(() => {
		player.queue = tracks;
	});
</script>

<Collection
	content={{
		id: album.id,
		title: album.title,
		subtitle: album.artist,
		cover: albumCover(album.id),
		tracks,
		type: 'album'
	}}
/>
