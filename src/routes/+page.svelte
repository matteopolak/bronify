<script lang="ts">
	import Cover from '$lib/components/cover.svelte';
	import Artist from '$lib/components/artist.svelte';
	import { player, global } from '$lib/player.svelte';
	import Fuse from 'fuse.js';
	import { artistData, trackData, albumData, albumThumbnail } from '$lib/get';
	import type { Collection } from '$lib/types';

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

	function collectionPrefix(content: Pick<Collection, 'type'>): string {
		if (content.type === 'playlist') {
			return 'Playlist • ';
		}

		if (content.type === 'album') {
			return 'Album • ';
		}

		return '';
	}
</script>

{#snippet collection(content: Omit<Collection, 'tracks'>)}
	<a
		class="hover:bg-base-300/50 flex flex-row gap-2 rounded-md p-2"
		href="/{content.type}s/{content.id}"
	>
		<img
			src={content.cover}
			alt="Album cover"
			class="h-24 w-24"
			class:rounded-full={content.type === 'artist'}
			class:rounded-md={content.type !== 'artist'}
		/>

		<div class="flex flex-col">
			<h2 class="text-3xl font-semibold">{content.title}</h2>
			<p class="text-lg text-neutral-300">{collectionPrefix(content)}{content.subtitle}</p>
		</div>
	</a>
{/snippet}

<div class="space-y-6 p-3">
	<div class="flex flex-col gap-2 md:hidden">
		{#each albumData as album (album.id)}
			{@render collection({
				id: album.id,
				title: album.title,
				subtitle: album.artist,
				cover: albumThumbnail(album.id),
				type: 'album'
			})}
		{/each}
	</div>

	<!--
	<div>
		<h1 class="p-2 text-2xl font-semibold text-neutral-100">Recommended artists</h1>

		<div class="grid w-full grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8">
			{#each artists as artist (artist.id)}
				<Artist {artist} />
			{/each}
		</div>
	</div>
	-->

	<div>
		<h1 class="p-2 text-2xl font-semibold text-neutral-100">Your top mixes</h1>

		<div class="grid w-full grid-cols-1 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{#each tracks as track (track.id)}
				<Cover {track} onClick={() => player.toggle(track)} />
			{/each}
		</div>
	</div>
</div>
