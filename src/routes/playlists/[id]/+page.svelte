<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import PlaylistComponent from '$lib/components/playlist.svelte';
	import { player } from '$lib/player.svelte';
	import { decodePlaylist, playlists } from '$lib/playlist.svelte';

	let playlist = $derived(playlists.find((p) => p.id === $page.params.id));
	let tracks = $derived(playlist?.tracks ?? []);

	$effect(() => {
		if (playlist) player.queue = tracks;
	});

	afterNavigate((opts) => {
		if (playlist && opts.type === 'enter' && tracks.length > 0) {
			player.track = tracks[0];
			player.load(player.track);
		}
	});
</script>

{#if playlist}
	<PlaylistComponent bind:playlist />
{:else}
	<PlaylistComponent playlist={decodePlaylist($page.params.id)!} />
{/if}
