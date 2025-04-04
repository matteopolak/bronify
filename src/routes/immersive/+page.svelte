<script lang="ts">
	import ControlsImmersive from '$lib/components/controls-immersive.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { getArtist, getArtistDisplayName, trackData, trackThumbnail } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import { ChevronDown } from '@lucide/svelte';

	function pastelColorFromString(str: string) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // Convert to 32bit integer
		}

		const hue = Math.abs(hash) % 360;
		const saturation = 50 + (Math.abs(hash) % 10); // Slightly lower saturation
		const lightness = 30 + (Math.abs(hash) % 5); // Darker lightness range

		return `${hue} ${saturation}% ${lightness}%`;
	}

	let color = $derived(pastelColorFromString(player.track.id));
	let url = $derived(trackThumbnail(player.track.id));

	$effect(() => {
		if (player.queue.length === 0) {
			player.queue = trackData;
		}
	});
</script>

<div
	class="flex h-dvh w-full max-w-screen flex-col gap-4 overflow-hidden px-8 pb-6"
	style="background-color: hsl({color})"
>
	<button class="absolute top-3 left-3 cursor-pointer" onclick={() => window.history.back()}>
		<ChevronDown />
	</button>

	<span class="pt-3 pb-6 text-center text-sm font-bold"> Now Playing </span>

	<img src={url} class="z-20 w-full rounded-lg" alt="Album Art" />

	<div class="relative z-10 overflow-visible pb-2">
		<h1 class="text-3xl font-bold text-white">
			{player.track.title}
		</h1>

		<a href="/artists/{getArtistDisplayName(getArtist(player.track.artist))}">
			<h2 class="text-xl text-slate-300">
				{getArtistDisplayName(getArtist(player.track.artist))}
			</h2>
		</a>

		<div
			class="pointer-events-none absolute -bottom-8 left-0 -z-10 h-8 w-full bg-red-400 sm:hidden"
			style="background: linear-gradient(180deg, hsl({color}) 0%, rgba(0, 0, 0, 0) 100%);"
		></div>
	</div>

	<div class="overflow-y-auto">
		{#if player.lyrics}
			<Lyrics
				lyrics={player.lyrics}
				currentTime={player.currentSeconds}
				onLyricClick={(start) => player.seek(start)}
			/>
		{/if}
	</div>

	<div class="relative z-10 pt-2">
		<div
			class="pointer-events-none absolute -top-8 left-0 -z-10 h-8 w-full sm:hidden"
			style="background: linear-gradient(0deg, hsl({color}) 0%, rgba(0, 0, 0, 0) 100%);"
		></div>

		<ControlsImmersive />
	</div>
</div>
