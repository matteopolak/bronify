<script lang="ts">
	import Cover from '$lib/components/cover.svelte';
	import { player, global } from '$lib/player.svelte';
	import Fuse from 'fuse.js';
	import { trackData, categoryData, categoryThumbnail } from '$lib/get';
	import type { Collection } from '$lib/types';
	import Scrollable from '$lib/components/scrollable.svelte';
	import VerticalCover from '$lib/components/vertical-cover.svelte';

	const trackIndex = new Fuse(trackData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	let tracks = $derived(
		global.search ? trackIndex.search(global.search, { limit: 15 }).map((s) => s.item) : trackData
	);

	let categories = $derived(
		Object.entries(categoryData).sort((a, b) => {
			return a[1].localeCompare(b[1]);
		})
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

<div class="space-y-6 p-3">
	<Scrollable class="gap-1">
		{#each categories as [key, title] (key)}
			{@render collection({
				id: key,
				title: title,
				subtitle: '',
				cover: categoryThumbnail(key),
				type: 'tag'
			})}
		{/each}
	</Scrollable>

	<!-- New releases (within the last 24 hours) -->
	<div>
		<h1 class="p-2 text-2xl font-semibold text-neutral-100">Newest releases</h1>

		<Scrollable class="gap-0">
			{#each newReleases as track (track.id)}
				<VerticalCover {track} onClick={() => player.toggle(track)} />
			{/each}
		</Scrollable>
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
		<h1 class="p-2 text-2xl font-semibold text-neutral-100">All tracks</h1>

		<div class="grid w-full grid-cols-1 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{#each tracks as track (track.id)}
				<Cover {track} onClick={() => player.toggle(track)} />
			{/each}
		</div>
	</div>
</div>
