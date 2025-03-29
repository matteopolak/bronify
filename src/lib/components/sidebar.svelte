<script lang="ts">
	import albumData from '$lib/content/albums.json';
	import artistData from '$lib/content/artists.json';

	import { DYNAMIC_HEIGHT_CLASS_SIDEBAR, DYNAMIC_HEIGHT_CLASS } from '$lib/constants';
	import type { Artist } from '$lib/types';
	import { Library, Plus } from '@lucide/svelte';
	import { albumThumbnail, artistThumbnail } from '$lib/get';
	import type { Snippet } from 'svelte';
	import Fuse from 'fuse.js';
	import { createPlaylist, encodePlaylist, generateArtBlob, playlists } from '$lib/playlist.svelte';
	import CollectionCover from './collection-cover.svelte';
	import { goto } from '$app/navigation';

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

	let albums = $derived(search ? albumIndex.search(search).map((s) => s.item) : betterAlbumData);
	let artists = $derived(search ? artistIndex.search(search).map((s) => s.item) : artistData);

	function onPlaylistAdd() {
		const playlist = createPlaylist({
			title: `Playlist #${playlists.length + 1}`,
			tracks: []
		});

		goto(`/playlists/${playlist.id}`);
	}
</script>

<div class="drawer md:drawer-open px-0 md:px-2">
	<input {id} type="checkbox" class="drawer-toggle" />

	<div class="drawer-content pb-32 md:pl-2 {DYNAMIC_HEIGHT_CLASS}">
		{@render children()}
	</div>
	<div class="drawer-side {DYNAMIC_HEIGHT_CLASS_SIDEBAR} z-20 rounded-lg">
		<label for="sidebar" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="bg-base-200 text-base-content flex min-h-full w-3xs flex-col gap-1 p-2 lg:w-2xs">
			<h1 class="flex w-full flex-row place-items-center gap-1 p-4 font-semibold text-neutral-400">
				<Library class="inline" />
				Your Library

				<button class="btn btn-ghost btn-circle ml-auto" onclick={onPlaylistAdd}>
					<Plus />
				</button>
			</h1>

			<div class="flex flex-row gap-2">
				<input
					type="text"
					class="input input-sm bg-base-300/50 text-base-content placeholder:text-base-content/50 w-full border-none"
					placeholder="Search your library"
					bind:value={search}
				/>
			</div>

			{#each playlists as playlist (playlist.id)}
				{@const id = encodePlaylist(playlist)}
				{@const promiseThumb = generateArtBlob(id, 256, 256)}

				<CollectionCover
					content={{
						id,
						title: playlist.title,
						subtitle: 'You',
						cover: promiseThumb,
						type: 'playlist'
					}}
				/>
			{/each}

			{#each albums as album (album.id)}
				<CollectionCover
					content={{
						id: album.id,
						title: album.title,
						subtitle: album.artist.display_name ?? album.artist.id,
						cover: albumThumbnail(album.id),
						type: 'album'
					}}
				/>
			{/each}

			{#each artists as artist (artist.id)}
				<CollectionCover
					content={{
						id: artist.id,
						title: artist.display_name ?? artist.id,
						subtitle: 'Artist',
						cover: artistThumbnail(artist.id),
						type: 'artist'
					}}
				/>
			{/each}
		</div>
	</div>
</div>
