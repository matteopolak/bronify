<script lang="ts">
	import Fuse from 'fuse.js';

	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Collection from '$lib/components/collection.svelte';
	import { albumCover, getAlbum, getArtist, getArtistDisplayName, getTrack } from '$lib/get';
	import { player, global } from '$lib/player.svelte';

	let album = $derived(getAlbum($page.params.id));
	let tracks = $derived(album.trackIds.map(getTrack));
	let artist = $derived(getArtist(album.artist));

	let trackIndex = $derived(
		new Fuse(tracks, {
			keys: ['title', 'tags'],
			threshold: 0.4
		})
	);

	let filter = $derived(
		global.search ? trackIndex.search(global.search).map((r) => r.item) : tracks
	);

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
		id: album.id,
		title: album.title,
		subtitle: getArtistDisplayName(artist ?? { username: album.artist }),
		cover: albumCover(album.id),
		tracks: filter,
		type: 'album'
	}}
/>
