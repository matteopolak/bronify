<script lang="ts">
	import { player } from '$lib/player.svelte';
	import type { Collection } from '$lib/types';
	import HorizontalCover from './horizontal-cover.svelte';

	let { content }: { content: Collection } = $props();
</script>

<div
	style="background-image: url({content.cover})"
	class="relative flex h-64 flex-col bg-cover bg-left-top md:h-80 lg:h-96"
>
	<div class="absolute inset-0 bg-black/40"></div>

	<div class="z-10 mt-auto flex flex-col gap-3 p-8 pb-12 lg:gap-4">
		{#if content.type === 'artist'}
			<span class="flex flex-row place-items-center gap-2 text-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="fill-blue-300"
					><path
						d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
					/><path d="m9 12 2 2 4-4" class="stroke-white" /></svg
				>
				Verified Artist
			</span>
		{/if}

		<h2 class="text-7xl font-extrabold lg:text-8xl">{content.title}</h2>
		<p class="text-md text-neutral-300">{content.subtitle}</p>
	</div>
</div>

<div class="relative">
	<div
		class="to-base-200 from-primary/20 pointer-events-none absolute top-0 left-0 h-64 w-full bg-linear-to-b"
	></div>

	<div class="grid w-full max-w-5xl grid-cols-1 gap-2 p-6">
		{#each content.tracks as track, idx (track.id)}
			<HorizontalCover number={idx + 1} {track} onClick={() => player.toggle(track)} />
		{/each}
	</div>
</div>
