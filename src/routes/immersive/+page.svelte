<script lang="ts">
	import Artists from '$lib/components/artists.svelte';
	import ControlsImmersive from '$lib/components/controls-immersive.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { trackData, trackThumbnail } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import { ChevronDown } from '@lucide/svelte';

	let url = $derived(trackThumbnail(player.track.id));

	$effect(() => {
		if (player.queue.length === 0) {
			player.queue = trackData;
		}
	});
</script>

<div
	class="flex h-dvh w-full max-w-screen flex-col gap-4 overflow-hidden px-8 pb-6"
	style="background-color: {player.track.colour};"
>
	<a class="absolute top-3 left-3 cursor-pointer" href="/" aria-label="Home">
		<ChevronDown />
	</a>

	<span class="pt-3 pb-6 text-center text-sm font-bold"> Now Playing </span>

	<img src={url} class="z-20 w-full rounded-lg" alt="Album Art" />

	<div class="relative z-10 overflow-visible pb-0">
		<h1 class="text-3xl font-bold text-white">
			{player.track.title}
		</h1>

		<Artists artistIds={player.track.artists} />

		<div
			class="pointer-events-none absolute -bottom-7 left-0 -z-10 h-8 w-full bg-red-400 sm:hidden"
			style="background: linear-gradient(180deg, {player.track.colour} 80%, rgba(0, 0, 0, 0) 100%);"
		></div>
	</div>

	<div class="overflow-x-hidden overflow-y-auto">
		{#if player.lyrics}
			<Lyrics
				lyrics={player.lyrics}
				currentTime={player.currentSeconds}
				onLyricClick={(start) => player.seek(start)}
			/>
		{/if}
	</div>

	<div class="relative z-10">
		<div
			class="pointer-events-none absolute -top-8 left-0 -z-10 h-8 w-full sm:hidden"
			style="background: linear-gradient(0deg, {player.track.colour} 80%, rgba(0, 0, 0, 0) 100%);"
		></div>

		<ControlsImmersive />
	</div>
</div>
