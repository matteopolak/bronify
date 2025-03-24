<script lang="ts">
	import bronify from '$lib/images/bronify.png?enhanced';
	import songData from '$lib/content/songs.json';

	import { Play, Pause } from '@lucide/svelte';
	import Player from 'youtube-player';
	import type { YouTubePlayer } from 'youtube-player/dist/types';

	type Song = (typeof songData)[number];

	const thumbnails: Record<string, { default: string }> = import.meta.glob(
		'/src/lib/content/*.webp',
		{
			query: '?url',
			eager: true
		}
	);

	import { shortcut, type ShortcutEventDetail } from '@svelte-put/shortcut';
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';

	const songIndex = new Fuse(songData, {
		keys: ['title', 'artist', 'tags', 'username'],
		threshold: 0.4
	});

	let searchInput: HTMLInputElement = $state()!;
	let comingSoonModal: HTMLDialogElement = $state()!;

	function handleK(detail: ShortcutEventDetail) {
		detail.originalEvent.preventDefault();
		searchInput.focus();
	}

	let search = $state('');
	let songs = $derived(
		search ? songIndex.search(search, { limit: 15 }).map((s) => s.item) : songData
	);

	let playing: Song | undefined = $state();
	let status = $state({
		paused: true,
		lengthSeconds: 60,
		currentSeconds: 0
	});

	async function toggle(song: Song) {
		if (playing?.id !== song.id) {
			playing = undefined;

			await player.loadVideoById(song.youtube);
			await player.playVideo();

			status.currentSeconds = 0;
			status.paused = false;

			playing = song;

			return;
		}

		status.paused = !status.paused;

		if (status.paused) {
			await player.pauseVideo();
		} else {
			await player.playVideo();
		}
	}

	let playerElement: HTMLDivElement = $state()!;
	let player: YouTubePlayer = $state()!;

	onMount(() => {
		player = Player(playerElement, {
			playerVars: {
				autoplay: 0
			}
		});
		player.setVolume(1);

		player.on('stateChange', async (event) => {
			if (event.data === 1) {
				status.lengthSeconds = await player.getDuration();
			}

			if (event.data === 0) {
				status.paused = true;
			}
		});

		setInterval(async () => {
			if (status.paused) return;

			const seconds = (await player.getCurrentTime()) ?? 0;
			status.currentSeconds = seconds;
		}, 100);
	});

	function onMouseDown(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		status.currentSeconds = status.lengthSeconds * value;
		player.seekTo(status.currentSeconds, true);
	}

	function formatSeconds(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<link rel="icon" href={bronify.img.src} />
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

<div class="navbar px-12">
	<div class="md:navbar-start hidden">
		<a href="/" class="flex flex-row place-items-center gap-2" aria-label="Bronify Home">
			<enhanced:img src={bronify} alt="Bronify" sizes="48px" class="h-12 w-12" />
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

<!-- Search results -->
{#snippet cover(song: Song)}
	{@const url = thumbnails[`/src/lib/content/${song.id}.webp`].default}

	<div
		class="group card hover:bg-base-200 flex w-auto flex-col gap-2 p-2 transition-all duration-100"
	>
		<div class="relative">
			<img src={url} alt={song.title} sizes="100px" class="h-auto w-auto rounded-lg" />

			<!-- Play button -->
			<button
				onclick={() => toggle(song)}
				class="bg-primary absolute right-2 bottom-2 cursor-pointer rounded-full p-3.5 text-left text-black transition-all duration-100 ease-in-out hover:right-1.5 hover:bottom-1.5 hover:p-4 md:opacity-0 md:group-hover:opacity-100"
			>
				{#if song.id === playing?.id && !status.paused}
					<Pause fill="currentColor" size="1.5em" />
				{:else}
					<Play fill="currentColor" size="1.5em" />
				{/if}
			</button>
		</div>

		<div class="flex flex-col gap-2">
			<h3 class="text-md font-semibold">{song.title}</h3>
			<span class="text-sm text-slate-300">
				By
				{#if song.username}
					<a href="https://www.tiktok.com/@{song.username}" class="hover:underline">{song.artist}</a
					>
				{:else}
					{song.artist}
				{/if}
			</span>
		</div>

		<div class="flex flex-row gap-1">
			{#each song.tags as tag (tag)}
				<span class="badge badge-ghost">{tag}</span>
			{/each}
		</div>
	</div>
{/snippet}

<div class="flex w-full place-content-center">
	<div
		class="grid max-w-7xl grid-cols-1 gap-8 p-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
	>
		{#each songs as song (song.id)}
			{@render cover(song)}
		{/each}
	</div>
</div>

<!-- Sticky to bottom of page, current song status -->
{#snippet controls(song: Song)}
	{@const url = thumbnails[`/src/lib/content/${song.id}.webp`].default}

	<div class="navbar-start h-16 grow gap-2 self-start md:self-auto">
		<img src={url} alt={song.title} sizes="16px" class="h-full rounded-lg" />

		<div>
			<h3 class="text-sm font-semibold">{song.title}</h3>
			<span class="text-sm text-slate-300">
				By
				{#if song.username}
					<a href="https://www.tiktok.com/@{song.username}" class="hover:underline">{song.artist}</a
					>
				{:else}
					{song.artist}
				{/if}
			</span>
		</div>
	</div>

	<div class="navbar-end lg:navbar-center w-auto max-w-lg flex-col gap-2 lg:w-full">
		<button
			onclick={() => toggle(song)}
			class="bg-base-content cursor-pointer rounded-full p-2 text-left text-black transition-all duration-100 ease-in-out hover:-m-0.5 hover:p-2.5"
		>
			{#if !status.paused}
				<Pause fill="currentColor" size="1em" />
			{:else}
				<Play fill="currentColor" size="1em" />
			{/if}
		</button>

		<div class="flex flex-row place-items-center gap-2 lg:w-full">
			<span class="text-xs text-slate-300">
				{formatSeconds(status.currentSeconds)}
			</span>
			<button onmousedown={onMouseDown} class="hidden w-full cursor-pointer lg:flex">
				<progress
					class="progress h-1.5 w-full"
					value={status.currentSeconds / status.lengthSeconds}
					max={1}
				></progress>
			</button>
			<span class="lg:hidden"> / </span>
			<span class="text-xs text-slate-300">
				{formatSeconds(status.lengthSeconds)}
			</span>
		</div>
	</div>
	<div class="lg:navbar-end"></div>
{/snippet}

<footer
	class="footer footer-horizontal footer-center bg-base-100 text-base-content rounded p-10 pb-30"
>
	<nav class="grid grid-flow-col gap-4">
		<a class="link link-hover" href="mailto:bronifyplaceholders@gmail.com"
			>Contact (for takedown requests or additions)</a
		>
	</nav>
	<aside>
		<p>
			Copyright © {new Date().getFullYear()} - No rights reserved by Bronify. Feel free to take anything.
		</p>
	</aside>
</footer>

<div
	class="bg-base-100 navbar border-base-200 fixed right-0 bottom-0 left-0 h-20 flex-row gap-0 border-t p-4"
>
	{@render controls(playing ?? songData[0])}
</div>
