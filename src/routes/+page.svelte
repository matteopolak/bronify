<script lang="ts">
	import Cover from '$lib/components/cover.svelte';
	import { player, global } from '$lib/player.svelte';
	import Fuse from 'fuse.js';
	import { trackData, categoryData, categoryThumbnail, albumData, artistData } from '$lib/get';
	import type { Artist, Collection } from '$lib/types';
	import Scrollable from '$lib/components/scrollable.svelte';
	import VerticalCover from '$lib/components/vertical-cover.svelte';
	import VerticalAlbum from '$lib/components/vertical-album.svelte';
	import news from '$lib/images/news.jpg?enhanced';

	import { fade } from 'svelte/transition';
	import VerticalArtist from '$lib/components/vertical-artist.svelte';

	const trackIndex = new Fuse(trackData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	const trackCountByCategory = new Map<string, number>();

	for (const track of trackData) {
		for (const tag of track.tags) {
			if (trackCountByCategory.has(tag)) {
				trackCountByCategory.set(tag, trackCountByCategory.get(tag)! + 1);
			} else {
				trackCountByCategory.set(tag, 1);
			}
		}
	}

	const categoryList = Object.entries(categoryData).sort((a, b) => {
		return (trackCountByCategory.get(b[0]) ?? 0) - (trackCountByCategory.get(a[0]) ?? 0);
	});

	const categoryIndex = new Fuse(categoryList, {
		keys: ['1'],
		threshold: 0.4
	});

	const betterAlbumData = albumData.map((album) => ({
		...album,
		artistFull: (artistData.find((artist) => artist.id === album.artist) as
			| Pick<Artist, 'id' | 'display_name'>
			| undefined) ?? {
			id: album.artist,
			display_name: album.artist
		}
	}));

	const albumIndex = new Fuse(betterAlbumData, {
		keys: ['title', 'artistFull.id', 'artistFull.display_name'],
		threshold: 0.4
	});

	const artistIndex = new Fuse(artistData, {
		keys: ['id', 'tiktok', 'soundcloud', 'spotify', 'display_name'],
		threshold: 0.4
	});

	let artists = $derived(
		global.search ? artistIndex.search(global.search).map((s) => s.item) : artistData
	);

	let albums = $derived(
		global.search ? albumIndex.search(global.search).map((s) => s.item) : betterAlbumData
	);

	let tracks = $derived(
		global.search ? trackIndex.search(global.search, { limit: 15 }).map((s) => s.item) : trackData
	);

	let categories = $derived(
		global.search
			? categoryIndex
					.search(global.search, {
						limit: 15
					})
					.map((s) => s.item)
			: categoryList
	);

	let newReleases = $derived(
		tracks
			.slice()
			.sort((a, b) => {
				return b.createdAt - a.createdAt;
			})
			.slice(0, 20)
	);

	$effect(() => {
		player.queue = tracks;
	});

	const ANIMATION_TIME = 300;
</script>

{#snippet collection(content: Omit<Collection, 'tracks'>)}
	<a
		class="group card hover:bg-base-300/50 flex h-auto w-48 flex-shrink-0 flex-col gap-2 p-3 text-left transition-all duration-100 sm:flex-col"
		href="/{content.type}s/{content.id}"
	>
		<img
			loading="lazy"
			src={content.cover}
			alt="Category {content.title}"
			class="aspect-square w-48 rounded-lg object-cover"
		/>

		<div class="flex flex-col">
			<h2 class="truncate text-lg font-semibold">{content.title}</h2>
			<span class="text-sm text-slate-300">Category</span>
		</div>
	</a>
{/snippet}

<div class="relative z-0 space-y-6">
	<div
		class="to-base-200 from-primary/20 pointer-events-none absolute top-0 left-0 -z-10 h-96 w-full bg-linear-to-b"
	></div>

	<div class="w-full pb-8">
		<div class="relative z-0 flex h-64 flex-col md:h-80 lg:h-96">
			<enhanced:img
				src={news}
				alt="News"
				class="absolute -z-10 h-full w-full object-cover object-top brightness-60"
				sizes="1920px"
			/>

			<div class="mt-auto flex flex-col gap-3 p-8 pb-12 lg:gap-4">
				<h2 class="text-5xl font-extrabold md:text-7xl lg:text-8xl">Missing a track?</h2>
				<p class="text-md text-lg text-neutral-300">
					DM me on TikTok at <a href="https://tiktok.com/@bronify.love" class="font-bold underline"
						>@bronify.love</a
					>.
				</p>
			</div>
		</div>
	</div>

	<!-- New releases (within the last 24 hours) -->
	{#if newReleases.length}
		<div class="p-3">
			<h1 class="p-2 text-2xl font-bold text-neutral-100">Newest releases</h1>

			<Scrollable class="gap-0">
				{#each newReleases as track (track.id)}
					<div transition:fade={{ duration: ANIMATION_TIME }}>
						<VerticalCover
							{track}
							onClick={() => {
								player.queue = newReleases;
								player.toggle(track);
							}}
						/>
					</div>
				{/each}
			</Scrollable>
		</div>
	{/if}

	<!-- Albums -->
	{#if albums.length}
		<div class="p-3">
			<h1 class="p-2 text-2xl font-semibold text-neutral-100">Featured albums</h1>

			<Scrollable class="gap-0">
				{#each albums as album (album.id)}
					<div transition:fade={{ duration: ANIMATION_TIME }}>
						<VerticalAlbum {album} />
					</div>
				{/each}
			</Scrollable>
		</div>
	{/if}

	{#if categories.length}
		<div class="p-3">
			<h1 class="p-2 text-2xl font-semibold text-neutral-100">Popular categories</h1>
			<Scrollable class="gap-1">
				{#each categories as [key, title] (key)}
					<div transition:fade={{ duration: ANIMATION_TIME }}>
						{@render collection({
							id: key,
							title: title,
							subtitle: '',
							cover: categoryThumbnail(key),
							type: 'tag'
						})}
					</div>
				{/each}
			</Scrollable>
		</div>
	{/if}

	{#if artists.length}
		<div class="p-3">
			<h1 class="p-2 text-2xl font-semibold text-neutral-100">Top artists</h1>
			<Scrollable class="gap-1">
				{#each artists as artist (artist.id)}
					<div transition:fade={{ duration: ANIMATION_TIME }}>
						<VerticalArtist {artist} />
					</div>
				{/each}
			</Scrollable>
		</div>
	{/if}

	{#if tracks.length}
		<div class="p-3">
			<h1 class="p-2 text-2xl font-semibold text-neutral-100">Everything else ig</h1>

			<div class="grid w-full grid-cols-1 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each tracks as track (track.id)}
					<div transition:fade={{ duration: ANIMATION_TIME }}>
						<Cover {track} onClick={() => player.toggle(track)} />
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
