<script lang="ts">
	import bronify from '$lib/images/bronify.png?enhanced';
	import songData from '$lib/content/songs.json';

	import { Play, Pause, Volume1, Volume2, VolumeX } from '@lucide/svelte';
	import Player from 'youtube-player';
	import type { YouTubePlayer } from 'youtube-player/dist/types';

	type Song = (typeof songData)[number];

	const MAX_VOLUME = 50;

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
		currentSeconds: 0,
		volume: 20
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

		player.setVolume(status.volume);

		player.on('stateChange', async (event) => {
			if (event.data === 1) {
				status.lengthSeconds = await player.getDuration();
				status.volume = await player.getVolume();
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

	function onSeekClick(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		player.seekTo(status.lengthSeconds * value, true);
	}

	function onSeekDrag(event: MouseEvent) {
		if (event.buttons !== 1) return;

		onSeekClick(event);
	}

	function onVolumeClick(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		status.volume = value * MAX_VOLUME;
		player.setVolume(status.volume);
	}

	function onVolumeDrag(event: MouseEvent) {
		if (event.buttons !== 1) return;

		onVolumeClick(event);
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

<div class="navbar px-4 md:px-12">
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
		class="group card hover:bg-base-200 flex h-28 w-auto flex-row gap-2 p-2 transition-all duration-100 sm:h-auto sm:flex-col"
	>
		<div class="relative">
			<img
				src={url}
				alt={song.title}
				class="h-24 w-24 rounded-lg group-hover:brightness-50 sm:h-auto sm:w-auto sm:group-hover:brightness-100"
			/>

			<!-- Play button -->
			<button
				onclick={() => toggle(song)}
				class="sm:bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3.5 text-left text-white opacity-0 transition-all duration-100 ease-in-out group-hover:opacity-100 sm:top-auto sm:right-2 sm:bottom-2 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:text-black sm:hover:right-[0.45rem] sm:hover:bottom-[0.45rem] sm:hover:p-[0.925rem]"
			>
				{#if song.id === playing?.id && !status.paused}
					<Pause fill="currentColor" size="1.5em" />
				{:else}
					<Play fill="currentColor" size="1.5em" />
				{/if}
			</button>
		</div>

		<div class="flex flex-col gap-1">
			<div class="flex flex-col">
				<h3 class="text-md line-clamp-1 font-semibold">{song.title}</h3>
				<span class="text-sm text-slate-300">
					By
					{#if song.username}
						<a href="https://www.tiktok.com/@{song.username}" class="hover:underline"
							>{song.artist}</a
						>
					{:else}
						{song.artist}
					{/if}
				</span>
			</div>

			<div class="hide-scrollbar mt-auto flex flex-row flex-nowrap gap-1 overflow-x-auto">
				{#each song.tags as tag (tag)}
					<span class="badge badge-ghost break-keep">{tag}</span>
				{/each}
			</div>
		</div>
	</div>
{/snippet}

<div class="flex w-full place-content-center">
	<div
		class="grid w-full max-w-7xl grid-cols-1 gap-4 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
	>
		{#each songs as song (song.id)}
			{@render cover(song)}
		{/each}
	</div>
</div>

{#snippet volume(value: number)}
	{#if value > 50}
		<Volume2 fill="currentColor" size="1em" />
	{:else if value > 0}
		<Volume1 fill="currentColor" size="1em" />
	{:else}
		<VolumeX fill="currentColor" size="1em" />
	{/if}

	<button
		onmousedown={onVolumeClick}
		onmousemove={onVolumeDrag}
		class="flex cursor-pointer place-items-center"
		aria-label="Volume"
	>
		<progress class="progress h-1.5 w-20" value={value / 100} max={MAX_VOLUME / 100}></progress>
	</button>
{/snippet}

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

	<div
		class="navbar-end lg:navbar-center w-auto max-w-lg flex-row gap-8 pr-4 lg:w-full lg:flex-col lg:gap-2"
	>
		<div class="flex flex-col lg:hidden">
			<div class="flex flex-row place-items-center gap-2 place-self-end">
				<span class="text-xs text-slate-300">
					{formatSeconds(status.currentSeconds)}
				</span>

				<span> / </span>

				<span class="text-xs text-slate-300">
					{formatSeconds(status.lengthSeconds)}
				</span>
			</div>

			<div class="flex flex-row">
				{@render volume(status.volume)}
			</div>
		</div>

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

		<div class="hidden flex-row place-items-center gap-2 lg:flex lg:w-full">
			<span class="text-xs text-slate-300">
				{formatSeconds(status.currentSeconds)}
			</span>
			<button
				onmousedown={onSeekClick}
				onmousemove={onSeekDrag}
				class="flex w-full cursor-pointer"
				aria-label="Seek"
			>
				<progress
					class="progress h-1.5 w-full"
					value={status.currentSeconds / status.lengthSeconds}
					max={1}
				></progress>
			</button>
			<span class="text-xs text-slate-300">
				{formatSeconds(status.lengthSeconds)}
			</span>
		</div>
	</div>
	<div class="lg:navbar-end hidden pr-4">
		{@render volume(status.volume)}
	</div>
{/snippet}

<footer
	class="footer footer-horizontal footer-center bg-base-100 text-base-content rounded p-10 pb-30"
>
	<nav class="grid grid-flow-col gap-4">
		<a class="link link-hover" href="mailto:bronifyplaceholders@gmail.com">
			Contact (for takedown requests or additions)
		</a>
	</nav>
	<aside>
		<p>
			Copyright © {new Date().getFullYear()} - No rights reserved by Bronify. Feel free to take anything.
		</p>
	</aside>
</footer>

<div class="bg-base-100 border-base-200 fixed right-0 bottom-0 left-0 border-t">
	<div class="navbar h-20">
		{@render controls(playing ?? songData[0])}
	</div>

	<button
		onmousedown={onSeekClick}
		onmousemove={onSeekDrag}
		class="flex w-full cursor-pointer"
		aria-label="Seek"
	>
		<progress
			class="progress h-auto w-full !rounded-none lg:hidden [&::-moz-progress-bar]:rounded-l-none [&::-webkit-progress-bar]:rounded-l-none"
			value={status.currentSeconds / status.lengthSeconds}
			max={1}
		></progress>
	</button>
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
