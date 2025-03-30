<script lang="ts">
	import Fuse from 'fuse.js';

	import Cover from '$lib/components/cover.svelte';
	import { player } from '$lib/player.svelte';
	import { searchLyrics, trackData } from '$lib/get';
	import Scrollable from '$lib/components/scrollable.svelte';
	import VerticalCover from '$lib/components/vertical-cover.svelte';
	import { debounce } from '$lib/util';
	import { fade } from 'svelte/transition';

	const trackIndex = new Fuse(trackData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	let search = $state('');
	let rawSearch = $state('');

	const update = debounce(() => {
		search = rawSearch;
	}, 300);

	$effect(() => {
		if (rawSearch) {
			update();
		} else {
			search = '';
		}
	});

	let tracks = $derived(
		search ? trackIndex.search(search, { limit: 15 }).map((s) => s.item) : trackData
	);

	let tracksLyrics = $derived(search ? searchLyrics(search) : []);
</script>

<div class="flex flex-row place-items-center items-center justify-center gap-2 px-4 pt-12 pb-4">
	<label class="input input-xl bg-base-300/40 w-full max-w-md border-none">
		<svg class="h-[1.5em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><g
				stroke-linejoin="round"
				stroke-linecap="round"
				stroke-width="2.5"
				fill="none"
				stroke="currentColor"
				><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g
			></svg
		>
		<input
			bind:value={rawSearch}
			type="search"
			class="grow"
			placeholder="Search by artist, title, and lyrics"
			autocomplete="off"
		/>
	</label>
</div>

<!-- Search results for lyrics -->
{#if tracksLyrics.length}
	<div class="p-3">
		<h1 class="p-2 text-2xl font-bold text-neutral-100">Matching lyrics</h1>

		<Scrollable class="gap-0">
			{#each tracksLyrics as track (track.id)}
				<div transition:fade={{ duration: 300 }}>
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

<div class="grid w-full grid-cols-1 gap-1 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
	{#each tracks as track (track.id)}
		<Cover {track} onClick={() => player.toggle(track)} />
	{/each}
</div>
