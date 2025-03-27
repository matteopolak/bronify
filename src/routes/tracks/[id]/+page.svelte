<script lang="ts">
	import { page } from '$app/state';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { trackData, getTrack, trackThumbnail } from '$lib/get';
	import { player, resolveLyrics } from '$lib/player.svelte';

	let track = $derived(getTrack(page.params.id));
	let thumbnail = $derived(trackThumbnail(track.id));
	let lyrics: string | null = $state('');

	$effect(() => {
		player.queue = trackData;
	});

	$effect(() => {
		resolveLyrics(track).then((l) => {
			lyrics = l;
		});
	});
</script>

{#if lyrics}
	<Lyrics
		{lyrics}
		currentTime={-1}
		onLyricClick={(start) => {
			player.toggle(track, true);
			player.seek(start);
		}}
	/>
{/if}
