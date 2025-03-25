<script lang="ts">
	import bronify from '$lib/images/bronify.png?enhanced';

	import { Heart } from '@lucide/svelte';
	import PlayerFactory from 'youtube-player';
	import type { YouTubePlayer } from 'youtube-player/dist/types';

	import { shortcut, type ShortcutEventDetail } from '@svelte-put/shortcut';
	import Fuse from 'fuse.js';
	import { onDestroy, onMount } from 'svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import type { Song, TrackSettings } from '$lib/types';
	import Controls from '$lib/components/controls.svelte';
	import { artistData, songData } from '$lib/get';
	import Cover from '$lib/components/cover.svelte';
	import Artist from '$lib/components/artist.svelte';

	/*const albums: Record<string, Album> = {};

	for (const album of albumData) {
		albums[album.id] = album;
	}*/

	const songIndex = new Fuse(songData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	const artistIndex = new Fuse(artistData, {
		keys: ['id', 'tiktok'],
		threshold: 0.4
	});

	let searchInput: HTMLInputElement = $state()!;
	let comingSoonModal: HTMLDialogElement = $state()!;

	let controls: Controls = $state()!;

	function handleK(detail: ShortcutEventDetail) {
		detail.originalEvent.preventDefault();
		searchInput.focus();
	}

	let search = $state('');
	let songs = $derived(
		search ? songIndex.search(search, { limit: 15 }).map((s) => s.item) : songData
	);
	let artists = $derived(
		search ? artistIndex.search(search, { limit: 3 }).map((s) => s.item) : artistData
	);

	let lyricsWasEnabled = $state(false);
	let lastSearch = $state('');

	$effect(() => {
		if (search === lastSearch) return;

		if (!search && lastSearch) {
			settings.lyrics = lyricsWasEnabled;
		} else if (search && !lastSearch) {
			lyricsWasEnabled = settings.lyrics;
			settings.lyrics = false;
		}

		lastSearch = search;
	});

	let srt: string | undefined = $state();
	let settings: TrackSettings = $state({
		paused: true,
		lyrics: false,
		volume: 20,
		loop: 'none',
		shuffle: 'off'
	});
	let currentSeconds = $state(0);
	let playing: Song | undefined = $state();

	let playerElement: HTMLDivElement = $state()!;
	let player: YouTubePlayer = $state()!;

	onMount(() => {
		player = PlayerFactory(playerElement, {
			playerVars: {
				autoplay: 0
			}
		});
	});

	onDestroy(() => {
		player?.destroy();
	});
</script>

<svelte:head>
	<link rel="icon" href={bronify.img.src} />
	<link rel="apple-touch-icon" href={bronify.img.src} />

	<!-- Manifest -->
	<link rel="manifest" href="/manifest.webmanifest" />

	<meta name="description" content="Bronify: LeMusic for everyone" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Bronify: LeMusic for everyone</title>
</svelte:head>

<svelte:window
	use:shortcut={{
		trigger: {
			key: 'k',
			modifier: ['ctrl', 'meta'],
			callback: handleK
		}
	}}
	use:shortcut={{
		trigger: {
			key: 'Escape',
			callback: () => (settings.lyrics = false)
		}
	}}
/>

<div bind:this={playerElement} class="hidden"></div>

<dialog bind:this={comingSoonModal} id="coming-soon-modal" class="modal">
	<div class="modal-box bg-base-200 rounded-2xl">
		<form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">✕</button>
		</form>

		<h3 class="text-lg font-bold">Coming soon</h3>
		<p class="py-4">This feature is coming soon, stay tuned!</p>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<div class="navbar px-4 md:hidden">
	<div class="navbar-start">
		<a href="/" class="flex flex-row place-items-center gap-2 font-bold" aria-label="Bronify Home">
			<span class="text-red-500">
				<Heart size="1.5em" fill="currentColor" />
			</span>
			bronify.love
		</a>
	</div>

	<div class="navbar-end gap-2">
		<button class="btn btn-md" onclick={() => comingSoonModal.showModal()}>Sign in</button>
		<button class="btn btn-md btn-primary" onclick={() => comingSoonModal.showModal()}
			>Sign up</button
		>
	</div>
</div>

<div class="navbar px-4 md:px-12">
	<div class="md:navbar-start hidden">
		<a href="/" class="flex flex-row place-items-center gap-2 font-bold" aria-label="Bronify Home">
			<span class="text-red-500">
				<Heart size="1.5em" fill="currentColor" />
			</span>
			bronify.love
		</a>
	</div>

	<div class="navbar-center mx-auto w-full md:mx-0 md:w-auto">
		<label class="input input-lg w-full">
			<svg class="h-[1.5em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
				><g
					stroke-linejoin="round"
					stroke-linecap="round"
					stroke-width="2.5"
					fill="none"
					stroke="currentColor"
					><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g
				></svg
			>
			<input
				bind:this={searchInput}
				bind:value={search}
				type="search"
				class="grow"
				placeholder="What do you want to play?"
			/>
			<kbd class="kbd kbd-sm">⌘</kbd>
			<kbd class="kbd kbd-sm">K</kbd>
		</label>
	</div>

	<div class="md:navbar-end hidden gap-2">
		<button class="btn btn-md" onclick={() => comingSoonModal.showModal()}>Sign in</button>
		<button class="btn btn-md btn-primary" onclick={() => comingSoonModal.showModal()}
			>Sign up</button
		>
	</div>
</div>

{#if srt === undefined || !settings.lyrics}
	<!-- Search results -->
	<div class="flex w-full flex-col place-items-center gap-6">
		<div
			class="grid w-full max-w-7xl grid-cols-3 gap-4 p-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8"
		>
			{#each artists as artist (artist.id)}
				<Artist {artist} />
			{/each}
		</div>

		<div
			class="grid w-full max-w-7xl grid-cols-1 gap-4 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		>
			{#each songs as song (song.id)}
				<Cover
					{song}
					onClick={() => controls.toggleSong(song)}
					playing={playing?.id === song.id && !settings.paused}
				/>
			{/each}
		</div>
	</div>
{:else}
	<div class="flex w-full justify-center py-8">
		<Lyrics {srt} currentTime={currentSeconds} onLyricClick={(start) => controls.seekTo(start)} />
	</div>
{/if}

<div class="bg-base-100 border-base-200 fixed right-0 bottom-0 left-0 border-t">
	<Controls
		bind:this={controls}
		maxVolume={50}
		{player}
		initialSong={songData[0]}
		{songs}
		bind:lyricsSrt={srt}
		bind:currentSeconds
		bind:settings
		bind:playing
	/>
</div>
