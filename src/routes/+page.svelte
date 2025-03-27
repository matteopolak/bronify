<script lang="ts">
	import Cover from '$lib/components/cover.svelte';
	import Artist from '$lib/components/artist.svelte';
	import { player, global } from '$lib/player.svelte';
	import Fuse from 'fuse.js';
	import { artistData, trackData } from '$lib/get';

	const trackIndex = new Fuse(trackData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	const artistIndex = new Fuse(artistData, {
		keys: ['id', 'tiktok'],
		threshold: 0.4
	});

	let tracks = $derived(
		global.search ? trackIndex.search(global.search, { limit: 15 }).map((s) => s.item) : trackData
	);
	let artists = $derived(
		global.search ? artistIndex.search(global.search, { limit: 3 }).map((s) => s.item) : artistData
	);

	$effect(() => {
		player.queue = tracks;
	});
</script>

<div class="space-y-6 p-3">
	<div>
		<h1 class="p-2 text-2xl font-semibold text-neutral-100">Recommended artists</h1>

		<!-- Search results -->
		<div class="grid w-full grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8">
			{#each artists as artist (artist.id)}
				<Artist {artist} />
			{/each}
		</div>
	</div>

	<div>
		<h1 class="p-2 text-2xl font-semibold text-neutral-100">Your top mixes</h1>

		<div class="grid w-full grid-cols-2 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
			{#each tracks as track (track.id)}
				<Cover {track} onClick={() => player.toggle(track)} />
			{/each}
		</div>
	</div>
</div>
