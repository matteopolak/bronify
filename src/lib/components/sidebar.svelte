<script lang="ts">
	import albumData from '$lib/content/albums.json';
	import artistData from '$lib/content/artists.json';

	import { DYNAMIC_HEIGHT_CLASS_SIDEBAR, DYNAMIC_HEIGHT_CLASS } from '$lib/constants';
	import type { Artist, Collection } from '$lib/types';
	import { Library } from '@lucide/svelte';
	import { albumThumbnail, artistThumbnail } from '$lib/get';
	import type { Snippet } from 'svelte';
	import Fuse from 'fuse.js';

	const artistIndex = new Fuse(artistData, {
		keys: ['id', 'tiktok', 'soundcloud', 'display_name'],
		threshold: 0.4
	});

	const betterAlbumData = albumData.map((album) => ({
		...album,
		artist: (artistData.find((artist) => artist.id === album.artist) as
			| Pick<Artist, 'id' | 'display_name'>
			| undefined) ?? {
			id: album.artist,
			display_name: album.artist
		}
	}));

	const albumIndex = new Fuse(betterAlbumData, {
		keys: ['title', 'artist.id', 'artist.display_name'],
		threshold: 0.4
	});

	let { children, id }: { children: Snippet; id: string } = $props();

	let search = $state('');
	let selected: string | undefined = $state();

	let artists = $derived(search ? artistIndex.search(search).map((s) => s.item) : artistData);
	let albums = $derived(search ? albumIndex.search(search).map((s) => s.item) : betterAlbumData);

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
	{@const active = content.id === selected}

	<a
		class="flex flex-row gap-2 rounded-md p-2"
		class:active
		class:inactive={!active}
		href="/{content.type}s/{content.id}"
	>
		<img
			src={content.cover}
			loading="lazy"
			alt="Album cover"
			class="h-12 w-12"
			class:rounded-full={content.type === 'artist'}
			class:rounded-md={content.type !== 'artist'}
		/>

		<div class="flex flex-col">
			<h2 class="text-base">{content.title}</h2>
			<p class="text-sm text-neutral-300">{collectionPrefix(content)}{content.subtitle}</p>
		</div>
	</a>
{/snippet}

<div class="drawer md:drawer-open px-0 md:px-2">
	<input {id} type="checkbox" class="drawer-toggle" />

	<div class="drawer-content pb-32 md:pl-2 {DYNAMIC_HEIGHT_CLASS}">
		{@render children()}
	</div>
	<div class="drawer-side {DYNAMIC_HEIGHT_CLASS_SIDEBAR} z-20 rounded-lg">
		<label for="sidebar" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="bg-base-200 text-base-content flex min-h-full w-3xs flex-col gap-1 p-2 lg:w-2xs">
			<h1 class="p-4 font-semibold text-neutral-400">
				<Library class="inline" />
				Your Library
			</h1>

			<div class="flex flex-row gap-2">
				<input
					type="text"
					class="input input-sm bg-base-300/50 text-base-content placeholder:text-base-content/50 w-full border-none"
					placeholder="Search your library"
					bind:value={search}
				/>
			</div>

			{#each albums as album (album.id)}
				{@render collection({
					id: album.id,
					title: album.title,
					subtitle: album.artist.display_name ?? album.artist.id,
					cover: albumThumbnail(album.id),
					type: 'album'
				})}
			{/each}

			{#each artists as artist (artist.id)}
				{@render collection({
					id: artist.id,
					title: artist.display_name ?? artist.id,
					subtitle: 'Artist',
					cover: artistThumbnail(artist.id),
					type: 'artist'
				})}
			{/each}
		</div>
	</div>
</div>

<style>
	@reference '../../app.css';

	.active {
		@apply bg-base-300/90;
	}

	.active:hover {
		@apply bg-base-300;
	}

	.inactive:hover {
		@apply bg-base-300/50;
	}
</style>
