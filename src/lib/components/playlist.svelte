<script lang="ts">
	import { player } from '$lib/player.svelte';
	import type { Playlist } from '$lib/types';
	import { onDestroy } from 'svelte';
	import HorizontalCover from './horizontal-cover.svelte';
	import { encodePlaylist, generateArtBlob, setTitle } from '$lib/playlist.svelte';
	import { goto } from '$app/navigation';

	let { playlist = $bindable() }: { playlist: Playlist } = $props();

	let cover: string | undefined = $state();

	$effect(() => {
		updateCover(playlist);
	});

	onDestroy(() => {
		if (cover) URL.revokeObjectURL(cover);
	});

	async function updateCover(playlist: Playlist) {
		const newCover = await generateArtBlob(encodePlaylist(playlist), 1920, 1080);

		if (cover) URL.revokeObjectURL(cover);
		cover = newCover;
	}

	let title = $state(playlist.title);

	$effect(() => {
		title = playlist.title;
	});

	function onTitleUpdate(title: string) {
		const newPlaylist = setTitle(playlist, title);

		goto(`/playlists/${newPlaylist.id}`, {
			replaceState: true
		});
	}
</script>

<div
	style="background-image: url({cover})"
	class="relative flex h-64 flex-col bg-black bg-cover bg-left-top md:h-80 lg:h-96"
>
	<div class="absolute inset-0 bg-black/40"></div>

	<div class="z-10 mt-auto flex flex-col gap-3 p-8 pb-12 lg:gap-4">
		<!-- Playlist titles can be edited -->
		<h2
			class="text-5xl font-extrabold focus-visible:outline-none md:text-7xl lg:text-8xl"
			contenteditable
			spellcheck={false}
			onfocusout={() => onTitleUpdate(title)}
			bind:innerText={title}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					onTitleUpdate(title);
				}
			}}
		></h2>
		<p class="text-md text-neutral-300">Playlist</p>
	</div>
</div>

<div class="relative">
	<div
		class="to-base-200 from-primary/20 pointer-events-none absolute top-0 left-0 h-64 w-full bg-linear-to-b"
	></div>

	<div class="grid w-full max-w-5xl grid-cols-1 gap-2 p-3 md:p-6">
		{#each playlist.tracks as track, idx (track.id)}
			<HorizontalCover
				number={idx + 1}
				{track}
				onClick={() => player.toggle(track)}
				bind:playlist
			/>
		{/each}
	</div>
</div>
