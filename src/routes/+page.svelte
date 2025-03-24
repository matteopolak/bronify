<script lang="ts">
	import bronify from '$lib/images/bronify.png?enhanced';
	import songData from '$lib/content/songs.json';

	import {
		Play,
		Pause,
		Volume1,
		Volume2,
		VolumeX,
		SkipBack,
		SkipForward,
		Repeat,
		Repeat1,
		Shuffle,
		MicVocal,
		Youtube
	} from '@lucide/svelte';
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
	import Lyrics from '$lib/components/lyrics.svelte';

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
	let srt: string | undefined = $state();
	let status = $state({
		paused: true,
		lengthSeconds: 60,
		currentSeconds: 0,
		volume: 20
	});

	function normalizeIndex(index: number, length: number) {
		return ((index % length) + length) % length;
	}

	function nextRelative(offset: number, overflow = true) {
		if (shuffleBehaviour === 'on') {
			const nextIndex = Math.floor(Math.random() * songs.length);
			return toggle(songs[nextIndex]);
		}

		const currentIndex = songs.findIndex((s) => s.id === playing?.id);
		const nextIndex = normalizeIndex(currentIndex + offset, songs.length);

		return toggle(songs[nextIndex]);
	}

	async function toggle(song: Song) {
		if (playing?.id !== song.id) {
			playing = undefined;
			srt = undefined;

			fetch(`/lyrics/${song.id}.srt`)
				.then(async (res) => {
					if (res.ok) {
						srt = await res.text();
					}
				})
				.catch(() => {});

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

	let loopBehaviour: 'one' | 'all' | 'none' = $state('none');
	let shuffleBehaviour: 'on' | 'off' = $state('off');
	let lyricsBehaviour: 'on' | 'off' = $state('off');

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
				if (loopBehaviour === 'one') {
					await player.seekTo(0, true);
					await player.playVideo();
				} else if (loopBehaviour === 'all') {
					await nextRelative(1);
				} else {
					await nextRelative(1, false);
				}
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
			callback: () => (lyricsBehaviour = 'off')
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

	<button
		class="group card hover:bg-base-200 flex h-28 w-auto cursor-pointer flex-row gap-2 p-2 text-left transition-all duration-100 sm:h-auto sm:flex-col"
		onclick={() => toggle(song)}
		aria-label="Play song"
	>
		<div class="relative">
			<img
				loading="lazy"
				src={url}
				alt={song.title}
				class="h-24 w-24 rounded-lg brightness-50 sm:h-auto sm:w-auto sm:brightness-100"
			/>

			<!-- Various badges (top right) like YouTube, Spotify, lyrics support -->
			<div class="absolute top-2 right-2 flex flex-row gap-1">
				{#if song.lyrics}
					<MicVocal size="1.2em" />
				{/if}

				<a
					href="https://youtube.com/watch?v=${song.youtube}"
					aria-label="YouTube"
					on:click={(e) => e.stopPropagation()}
				>
					<svg
						width="313.23315mm"
						height="216.02286mm"
						viewBox="0 0 313.23315 216.02286"
						version="1.1"
						id="svg5"
						xml:space="preserve"
						xmlns="http://www.w3.org/2000/svg"
						class="h-[1.2em] w-fit"
					>
						<g id="layer1" transform="translate(-54.079375,-5.2758072)">
							<path
								d="m 210.53177,221.29866 c 0,0 98.12514,0 122.46443,-6.48069 13.70449,-3.6724 24.01093,-14.2575 27.62825,-27.32688 6.68807,-23.97854 6.68807,-74.41988 6.68807,-74.41988 0,0 0,-50.117297 -6.68807,-73.879819 C 357.00713,25.79798 346.70069,15.42887 332.9962,11.864515 308.65691,5.2758072 210.53177,5.2758072 210.53177,5.2758072 c 0,0 -97.9062,0 -122.135976,6.5887078 -13.485335,3.564355 -24.010529,13.933465 -27.847831,27.326876 -6.468588,23.762522 -6.468588,73.879819 -6.468588,73.879819 0,0 0,50.44134 6.468588,74.41988 3.837302,13.06938 14.362496,23.65448 27.847831,27.32688 24.229776,6.48069 122.135976,6.48069 122.135976,6.48069 z"
								fill="currentColor"
								id="path1412"
								style="stroke-width:0.0208149"
								clip-path="none"
							/>
							<path
								d="M 259.30109,113.28723 178.29251,67.382379 v 91.809711 z"
								fill="#000000"
								id="path1414"
								style="stroke-width:0.0208149"
								clip-path="none"
							/>
						</g>
					</svg>
				</a>

				{#if song.spotify}
					<a
						href="https://open.spotify.com/track/${song.spotify}"
						aria-label="Spotify"
						on:click={(e) => e.stopPropagation()}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="168px"
							width="168px"
							version="1.1"
							viewBox="0 0 168 168"
							class="size-[1.2em]"
						>
							<path
								fill="currentColor"
								d="m83.996 0.277c-46.249 0-83.743 37.493-83.743 83.742 0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l0.001-0.004zm38.404 120.78c-1.5 2.46-4.72 3.24-7.18 1.73-19.662-12.01-44.414-14.73-73.564-8.07-2.809 0.64-5.609-1.12-6.249-3.93-0.643-2.81 1.11-5.61 3.926-6.25 31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-0.903-8.148-4.35-1.04-3.453 0.907-7.093 4.354-8.143 30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-0.001zm0.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219-1.254-4.14 1.08-8.513 5.221-9.771 29.581-8.98 78.756-7.245 109.83 11.202 3.73 2.209 4.95 7.016 2.74 10.733-2.2 3.722-7.02 4.949-10.73 2.739z"
							/>
						</svg>
					</a>
				{/if}
			</div>

			<!-- Play button -->
			<div
				class="sm:bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3.5 text-left text-white transition-all duration-100 ease-in-out group-hover:opacity-100 sm:top-auto sm:right-2 sm:bottom-2 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:text-black sm:opacity-0 sm:hover:right-[0.45rem] sm:hover:bottom-[0.45rem] sm:hover:p-[0.925rem]"
			>
				{#if song.id === playing?.id && !status.paused}
					<Pause fill="currentColor" size="1.5em" />
				{:else}
					<Play fill="currentColor" size="1.5em" />
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<div class="flex flex-col">
				<h3 class="text-md line-clamp-1 font-semibold">{song.title}</h3>
				<span class="text-sm text-slate-300">
					By
					{#if song.username}
						<a
							href="https://www.tiktok.com/@{song.username}"
							onclick={(e) => e.stopPropagation()}
							class="hover:underline">{song.artist}</a
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
	</button>
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

	<div class="navbar-start h-16 grow basis-full gap-2 self-start md:basis-auto md:self-auto">
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

		<div class="ml-auto flex flex-col pr-2 lg:hidden">
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
	</div>

	<div
		class="navbar-end lg:navbar-center w-auto max-w-lg flex-row gap-8 pr-4 lg:w-full lg:flex-col lg:gap-2"
	>
		<div class="flex flex-row gap-4">
			<button
				onclick={() => {
					shuffleBehaviour = shuffleBehaviour === 'off' ? 'on' : 'off';
				}}
				class="cursor-pointer text-left transition-all duration-100 ease-in-out"
				class:text-slate-400={shuffleBehaviour === 'off'}
				class:hover:text-white={shuffleBehaviour === 'off'}
				class:text-white={shuffleBehaviour !== 'off'}
			>
				<Shuffle size="1.3em" />
			</button>

			<button
				onclick={() => nextRelative(-1)}
				class="cursor-pointer text-left text-slate-400 transition-all duration-100 ease-in-out hover:text-white"
			>
				<SkipBack fill="currentColor" size="1.3em" />
			</button>

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

			<button
				onclick={() => nextRelative(1)}
				class="cursor-pointer text-left text-slate-400 transition-all duration-100 ease-in-out hover:text-white"
			>
				<SkipForward fill="currentColor" size="1.3em" />
			</button>

			<button
				onclick={() => {
					loopBehaviour =
						loopBehaviour === 'none' ? 'all' : loopBehaviour === 'all' ? 'one' : 'none';
				}}
				class="cursor-pointer text-left transition-all duration-100 ease-in-out"
				class:text-slate-400={loopBehaviour === 'none'}
				class:hover:text-white={loopBehaviour === 'none'}
				class:text-white={loopBehaviour !== 'none'}
			>
				{#if loopBehaviour === 'one'}
					<Repeat1 size="1.3em" />
				{:else}
					<Repeat size="1.3em" />
				{/if}
			</button>
		</div>

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
	<div class="lg:navbar-end hidden gap-5 pr-4">
		<button
			onclick={() => (lyricsBehaviour = lyricsBehaviour === 'off' ? 'on' : 'off')}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out"
			class:text-slate-400={lyricsBehaviour === 'off'}
			class:hover:text-white={lyricsBehaviour === 'off'}
			class:text-white={lyricsBehaviour !== 'off'}
		>
			<MicVocal size="1.3em" />
		</button>

		<div class="flex flex-row gap-1">
			{@render volume(status.volume)}
		</div>
	</div>
{/snippet}

<div
	class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 transition-opacity duration-300"
	class:opacity-0={srt === undefined || lyricsBehaviour === 'off'}
>
	{#if srt && lyricsBehaviour === 'on'}
		<Lyrics {srt} currentTime={status.currentSeconds} />
	{/if}
</div>

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
	<div class="navbar h-36 flex-wrap place-content-center md:h-20 md:flex-nowrap">
		{@render controls(playing ?? songData[0])}
	</div>

	<button
		onmousedown={onSeekClick}
		onmousemove={onSeekDrag}
		class="flex w-full cursor-pointer"
		aria-label="Seek"
	>
		<progress
			class="progress square-progress h-2 w-full !rounded-none lg:hidden"
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

	.square-progress::-webkit-progress-bar {
		border-bottom-left-radius: 0;
		border-top-left-radius: 0;
	}

	.square-progress::-webkit-progress-value {
		border-bottom-left-radius: 0;
		border-top-left-radius: 0;
	}

	.square-progress::-moz-progress-bar {
		border-bottom-left-radius: 0;
		border-top-left-radius: 0;
	}

	.square-progress::-moz-progress-value {
		border-bottom-left-radius: 0;
		border-top-left-radius: 0;
	}
</style>
