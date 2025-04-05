<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Collection from '$lib/components/collection.svelte';
	import { artistData, artistThumbnail, getArtistDisplayName, trackData } from '$lib/get';
	import { player } from '$lib/player.svelte';

	let artist = $derived(
		artistData.find((s) => s.username === $page.params.id || s.display_name === $page.params.id)!
	);
	let tracks = $derived(trackData.filter((s) => s.artists.includes(artist.id)));

	$effect(() => {
		player.queue = tracks;
	});

	afterNavigate((opts) => {
		if (opts.type === 'enter') {
			player.track = tracks[0];
			player.load(player.track);
		}
	});
</script>

<Collection
	content={{
		id: artist.id,
		title: getArtistDisplayName(artist),
		subtitle: 'Artist',
		cover: artistThumbnail(artist.id),
		tracks,
		type: 'artist'
	}}
/>
