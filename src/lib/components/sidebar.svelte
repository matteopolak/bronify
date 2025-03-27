<script lang="ts">
	import albumData from '$lib/content/albums.json';
	import artistData from '$lib/content/artists.json';

	import { DYNAMIC_HEIGHT_CLASS } from '$lib/constants';
	import type { Collection } from '$lib/types';
	import { Library } from '@lucide/svelte';
	import { albumThumbnail, artistThumbnail } from '$lib/get';

	let { children } = $props();

	let selected: string | undefined = $state();

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
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content pb-32 md:pl-2 {DYNAMIC_HEIGHT_CLASS}">
		{@render children()}
	</div>
	<div class="drawer-side {DYNAMIC_HEIGHT_CLASS} rounded-lg">
		<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="bg-base-200 text-base-content flex min-h-full w-3xs flex-col gap-1 p-2">
			<h1 class="p-4 font-semibold text-neutral-400">
				<Library class="inline" />
				Your Library
			</h1>

			{#each albumData as album (album.id)}
				{@render collection({
					id: album.id,
					title: album.title,
					subtitle: album.artist,
					cover: albumThumbnail(album.id),
					type: 'album'
				})}
			{/each}

			{#each artistData as artist (artist.id)}
				{@render collection({
					id: artist.id,
					title: artist.id,
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
