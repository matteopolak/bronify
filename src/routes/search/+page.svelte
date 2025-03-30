<script lang="ts">
	import Fuse from 'fuse.js';

	import Cover from '$lib/components/cover.svelte';
	import { player } from '$lib/player.svelte';
	import { trackData } from '$lib/get';

	const trackIndex = new Fuse(trackData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	let search = $state('');

	let tracks = $derived(
		search ? trackIndex.search(search, { limit: 15 }).map((s) => s.item) : trackData
	);
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
			bind:value={search}
			type="search"
			class="grow"
			placeholder="What do you want to play?"
			autocomplete="off"
		/>
	</label>
</div>

<div class="grid w-full grid-cols-1 gap-1 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
	{#each tracks as track (track.id)}
		<Cover {track} onClick={() => player.toggle(track)} />
	{/each}
</div>
