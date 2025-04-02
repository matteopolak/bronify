<script lang="ts">
	import { player, global } from '$lib/player.svelte';
	import Fuse from 'fuse.js';
	import {
		trackData,
		categoryData,
		categoryThumbnail,
		albumData,
		artistData,
		searchLyrics,
		getArtist,
		trackIndex
	} from '$lib/get';
	import type { Collection } from '$lib/types';
	import Scrollable from '$lib/components/scrollable.svelte';
	import VerticalCover from '$lib/components/vertical-cover.svelte';
	import VerticalAlbum from '$lib/components/vertical-album.svelte';
	import news from '$lib/images/news.jpg?enhanced';

	import { fade } from 'svelte/transition';
	import VerticalArtist from '$lib/components/vertical-artist.svelte';

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
		artistFull: getArtist(album.artist) ?? {
			username: album.artist,
			display_name: album.artist
		}
	}));

	const albumIndex = new Fuse(betterAlbumData, {
		keys: ['title', 'artistFull.username', 'artistFull.display_name'],
		threshold: 0.4
	});

	const artistIndex = new Fuse(artistData, {
		keys: ['username', 'tiktok', 'soundcloud', 'spotify', 'display_name'],
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

	let tracksLyrics = $derived(global.search ? searchLyrics(global.search) : []);

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
			class="aspect-square w-48 rounded-lg object-cover shadow-lg"
		/>

		<div class="flex flex-col">
			<h2 class="truncate text-lg font-semibold">{content.title}</h2>
			<span class="text-sm text-slate-300">Category</span>
		</div>
	</a>
{/snippet}

<div class="relative z-0">
	<div class="w-full">
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
					DM me on TikTok at <a href="https://tiktok.com/@bronify.love" class="font-bold underline">
						@bronify.love
					</a>
					or email
					<a href="mailto:contact@bronify.love" class="font-bold underline">contact@bronify.love</a
					>.
				</p>
			</div>
		</div>
	</div>

	<div class="relative space-y-6 pt-8">
		<div
			class="to-base-200 from-primary/20 pointer-events-none absolute top-0 left-0 -z-10 h-80 w-full bg-linear-to-b"
		></div>

		<!-- Search results for lyrics -->
		{#if tracksLyrics.length}
			<div class="p-3">
				<h1 class="p-2 text-2xl font-bold text-neutral-100">Matching lyrics</h1>

				<Scrollable class="gap-0" childrenCount={tracksLyrics.length}>
					{#each tracksLyrics as track (track.id)}
						<div transition:fade={{ duration: ANIMATION_TIME }}>
							<VerticalCover
								{track}
								onClick={() => {
									player.queue = tracksLyrics;
									player.toggle(track);
								}}
							/>
						</div>
					{/each}
				</Scrollable>
			</div>
		{/if}

		{#if tracks.length}
			<div class="p-3">
				<h1 class="p-2 text-2xl font-semibold text-neutral-100">All tracks</h1>

				<Scrollable class="gap-0" childrenCount={tracks.length}>
					{#each tracks as track (track.id)}
						<div transition:fade={{ duration: ANIMATION_TIME }}>
							<VerticalCover
								{track}
								onClick={() => {
									player.queue = tracks;
									player.toggle(track);
								}}
							/>
						</div>
					{/each}
				</Scrollable>
			</div>
		{/if}

		<!-- New releases (within the last 24 hours) -->
		{#if newReleases.length}
			<div class="p-3">
				<h1 class="p-2 text-2xl font-bold text-neutral-100">Newest releases</h1>

				<Scrollable class="gap-0" childrenCount={newReleases.length}>
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

				<Scrollable class="gap-0" childrenCount={albums.length}>
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
				<Scrollable class="gap-1" childrenCount={categories.length}>
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
				<Scrollable class="gap-1" childrenCount={artists.length}>
					{#each artists as artist (artist.id)}
						<div transition:fade={{ duration: ANIMATION_TIME }}>
							<VerticalArtist {artist} />
						</div>
					{/each}
				</Scrollable>
			</div>
		{/if}
	</div>
</div>
