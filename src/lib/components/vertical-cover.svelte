<script lang="ts">
	import { trackThumbnail, getArtist } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import type { Track } from '$lib/types';
	import { Pause, Play } from '@lucide/svelte';

	let { track, onClick }: { track: Track; onClick: () => void } = $props();

	let url = $derived(trackThumbnail(track.id));
	let artist = $derived(getArtist(track.artist));
	let playing = $derived(player.track.id === track.id && !player.paused);

	let anchor: HTMLAnchorElement = $state()!;
</script>

<button
	class="group card hover:bg-base-300/50 flex h-auto w-44 flex-shrink-0 cursor-pointer flex-col gap-2 p-3 text-left transition-all duration-100"
	onclick={(e) => {
		if (e.target !== anchor) {
			onClick();
		}
	}}
	aria-label="Play track"
>
	<div class="relative h-auto w-auto shrink-0">
		<img
			loading="lazy"
			src={url}
			alt={track.title}
			class="aspect-square h-auto w-auto rounded-lg brightness-50 sm:brightness-100"
		/>

		<!-- Play button -->
		<div
			class="sm:bg-primary absolute top-auto right-2 bottom-2 left-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3.5 text-left text-white opacity-0 transition-all duration-100 ease-in-out group-hover:opacity-100 hover:right-[0.45rem] hover:bottom-[0.45rem] hover:p-[0.925rem] sm:translate-x-0 sm:translate-y-0 sm:text-black"
		>
			{#if playing}
				<Pause fill="currentColor" size="1.2em" />
			{:else}
				<Play fill="currentColor" size="1.2em" />
			{/if}
		</div>
	</div>

	<div class="flex shrink flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-1 font-semibold">{track.title}</h3>
			<span class="text-sm text-slate-300">
				<a href="/artists/{artist.id}" class="hover:underline" bind:this={anchor}>
					{artist.display_name ?? track.artist}
				</a>
			</span>
		</div>

		<!--
		<div class="hide-scrollbar mt-auto flex flex-row flex-nowrap gap-1 overflow-x-auto">
			{#each track.tags as tag (tag)}
				<span class="badge badge-ghost break-keep">{tag}</span>
			{/each}
		</div>
		-->
	</div>
</button>
