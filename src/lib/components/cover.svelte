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
	class="group card hover:bg-base-300/50 flex h-28 w-auto cursor-pointer flex-row gap-2 p-3 text-left transition-all duration-100 sm:h-auto sm:flex-col"
	onclick={(e) => {
		if (e.target !== anchor) {
			onClick();
		}
	}}
	aria-label="Play track"
>
	<div class="relative h-24 w-24 shrink-0 sm:h-auto sm:w-auto">
		<img
			loading="lazy"
			src={url}
			alt={track.title}
			class="aspect-square h-24 w-24 rounded-lg brightness-50 sm:h-auto sm:w-auto sm:brightness-100"
		/>

		<!-- Play button -->
		<div
			class="sm:bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3.5 text-left text-white transition-all duration-100 ease-in-out group-hover:opacity-100 sm:top-auto sm:right-2 sm:bottom-2 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:text-black sm:opacity-0 sm:hover:right-[0.45rem] sm:hover:bottom-[0.45rem] sm:hover:p-[0.925rem]"
		>
			{#if playing}
				<Pause fill="currentColor" size="1.5em" />
			{:else}
				<Play fill="currentColor" size="1.5em" />
			{/if}
		</div>
	</div>

	<div class="flex shrink flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-2 font-semibold">{track.title}</h3>
			<span class="text-sm text-slate-300">
				By
				<a href="/artists/{artist.id}" class="hover:underline" bind:this={anchor}>
					{artist.display_name ?? track.artist}
				</a>
			</span>
		</div>
	</div>
</button>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
