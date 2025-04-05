<script lang="ts">
	import { getArtist, getArtistDisplayName } from '$lib/get';

	let {
		artistIds,
		anchors = $bindable([])
	}: { artistIds: string[]; anchors?: HTMLAnchorElement[] } = $props();

	let artists = $derived(artistIds.map(getArtist));
</script>

{#each artists as artist, i (artist.id)}
	{#if i > 0}
		,
	{/if}

	<a href="/artists/{getArtistDisplayName(artist)}" class="hover:underline" bind:this={anchors[i]}>
		{getArtistDisplayName(artist)}
	</a>
{/each}
