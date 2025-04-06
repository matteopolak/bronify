<script lang="ts">
	import { goto } from '$app/navigation';
	import Artists from '$lib/components/artists.svelte';
	import Karaoke from '$lib/components/buttons/karaoke.svelte';
	import ControlsImmersive from '$lib/components/controls-immersive.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { trackData, trackThumbnail } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import { ChevronDown } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let url = $derived(trackThumbnail(player.track.id));

	$effect(() => {
		if (player.queue.length === 0) {
			player.queue = trackData;
		}
	});

	let thumbnail: HTMLImageElement = $state()!;
	let height = $state(0);

	onMount(() => {
		height = thumbnail.clientHeight;
	});

	$effect(() => {
		if (!height) return;

		if (!player.karaoke) {
			thumbnail.style.height = `${height}px`;
		} else {
			thumbnail.style.height = '0px';
		}
	});

	function back() {
		if (history.length > 2) {
			history.back();
		} else {
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>{player.track.title} | Bronify</title>
</svelte:head>

<div
	class="flex h-dvh w-full max-w-screen flex-col gap-4 overflow-hidden px-8 pb-6"
	style="background-color: {player.track.colour};"
>
	<button class="absolute top-3 left-3 cursor-pointer" aria-label="Home" onclick={back}>
		<ChevronDown />
	</button>

	<span class="pt-3 pb-6 text-center text-sm font-bold"> Now Playing </span>

	<img
		bind:this={thumbnail}
		src={url}
		class="z-20 w-full rounded-lg object-cover transition-all duration-200"
		alt="Album Art"
	/>

	<div class="relative z-10 flex flex-row overflow-visible pb-0">
		<div>
			<h1 class="text-3xl font-bold text-white">
				{player.track.title}
			</h1>

			<Artists artistIds={player.track.artists} />
		</div>

		<Karaoke size="1.7em" class="mt-2 ml-auto self-start" />

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

	<div class="relative z-10 sm:hidden">
		<div
			class="pointer-events-none absolute -top-8 left-0 -z-10 h-8 w-full"
			style="background: linear-gradient(0deg, {player.track.colour} 80%, rgba(0, 0, 0, 0) 100%);"
		></div>

		<ControlsImmersive />
	</div>
</div>
