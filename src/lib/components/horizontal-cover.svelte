<script lang="ts">
	import { trackThumbnail, getArtist } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import type { Track } from '$lib/types';
	import { formatSeconds } from '$lib/util';
	import { MicVocal, Pause, Play } from '@lucide/svelte';

	let { track, number, onClick }: { track: Track; number: number; onClick: () => void } = $props();

	let url = $derived(trackThumbnail(track.id));
	let artist = $derived(getArtist(track.artist));
	let playing = $derived(player.track.id === track.id && !player.paused);
</script>

<button
	class="group card flex h-16 w-full cursor-pointer flex-row gap-2 rounded-md p-2 pr-4 text-left transition-all duration-100"
	onclick={onClick}
	aria-label="Play track"
	class:bg-base-300={playing}
	class:hover:bg-base-300={!playing}
>
	<div
		class="aspect-square place-items-center justify-center"
		class:flex={!playing}
		class:group-hover:hidden={!playing}
		class:hidden={playing}
	>
		<span class="text-md font-mono text-neutral-300">{number}</span>
	</div>

	<div
		class="aspect-square place-items-center justify-center"
		class:hidden={!playing}
		class:group-hover:flex={!playing}
		class:flex={playing}
	>
		{#if playing}
			<Pause fill="currentColor" size="1em" />
		{:else}
			<Play fill="currentColor" size="1em" />
		{/if}
	</div>

	<img
		loading="lazy"
		src={url}
		alt={track.title}
		class="h-12 w-12 rounded-lg brightness-50 sm:brightness-100"
	/>

	<div class="flex flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-1 font-semibold">{track.title}</h3>
			<span class="text-sm text-slate-300">
				By
				{#if artist.tiktok}
					<a
						href="https://www.tiktok.com/@{artist.tiktok}"
						onclick={(e) => e.stopPropagation()}
						class="hover:underline">{track.artist}</a
					>
				{:else}
					{track.artist}
				{/if}
			</span>
		</div>
	</div>

	<span class="ml-auto self-center font-mono text-sm text-slate-300">
		{formatSeconds(track.durationSeconds)}
	</span>
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
