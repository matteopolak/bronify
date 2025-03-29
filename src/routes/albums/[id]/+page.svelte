<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Collection from '$lib/components/collection.svelte';
	import { albumCover, trackData, getAlbum, getArtist } from '$lib/get';
	import { player } from '$lib/player.svelte';

	let album = $derived(getAlbum($page.params.id));
	let tracks = $derived(trackData.filter((s) => album.trackIds.includes(s.id)));
	let artist = $derived(getArtist(album.artist));

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
		subtitle: artist?.display_name ?? album.artist,
		cover: albumCover(album.id),
		tracks,
		type: 'album'
	}}
/>
