<script lang="ts">
	import ControlsImmersive from '$lib/components/controls-immersive.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { getArtist, trackData } from '$lib/get';
	import { player } from '$lib/player.svelte';

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

	$effect(() => {
		if (player.queue.length === 0) {
			player.queue = trackData;
		}
	});
</script>

<div
	class="flex h-screen w-full overflow-y-auto rounded-lg py-8 md:place-content-center"
	style="background-color: hsl({color})"
>
	{#if player.lyrics}
		<Lyrics
			lyrics={player.lyrics}
			currentTime={player.currentSeconds}
			onLyricClick={(start) => player.seek(start)}
		/>
	{/if}
</div>

<div
	class="pointer-events-none fixed top-0 z-30 flex w-screen flex-row place-content-center place-items-center"
>
	<div
		class="pointer-events-none fixed -top-2 left-0 -z-10 h-32 w-full sm:hidden"
		style="background: linear-gradient(180deg, hsl({color}) 20%, rgba(0, 0, 0, 0) 100%);"
	></div>

	<span class="pt-2 text-sm text-slate-300">
		{player.track.title}
		&bull;
		{getArtist(player.track.artist).display_name ?? player.track.artist}
	</span>
</div>

<div class="fixed bottom-0 z-30 pt-8">
	<div
		class="pointer-events-none fixed bottom-0 left-0 -z-10 h-96 w-full sm:hidden"
		style="background: linear-gradient(0deg, hsl({color}) 50%, rgba(0, 0, 0, 0) 100%);"
	></div>

	<ControlsImmersive />
</div>
