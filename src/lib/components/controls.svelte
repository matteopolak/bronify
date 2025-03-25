<script lang="ts">
	import { getArtist, songThumbnail } from '$lib/get';
	import type { Song, TrackSettings } from '$lib/types';
	import {
		MicVocal,
		Pause,
		Play,
		Repeat,
		Repeat1,
		Shuffle,
		SkipBack,
		SkipForward,
		Volume1,
		Volume2,
		VolumeX
	} from '@lucide/svelte';
	import { untrack } from 'svelte';
	import type { YouTubePlayer } from 'youtube-player/dist/types';

	let {
		initialSong,
		lyricsSrt = $bindable(),
		player,
		maxVolume = 50,
		songs,
		currentSeconds = $bindable(),
		settings = $bindable(),
		playing = $bindable()
	}: {
		initialSong: Song;
		lyricsSrt: string | undefined;
		player: YouTubePlayer;
		maxVolume: number;
		songs: Song[];
		currentSeconds: number;
		settings: TrackSettings;
		playing: Song | undefined;
	} = $props();

	let song = $state(initialSong);
	let artist = $derived(getArtist(song.artist));
	let lengthSeconds = $state(60);
	let url = $derived(songThumbnail(song.id));

	export async function toggleSong(next: Song) {
		if (playing?.id !== next.id) {
			playing = undefined;
			lyricsSrt = undefined;

			fetch(`/lyrics/${next.id}.srt`)
				.then(async (res) => {
					if (res.ok) {
						lyricsSrt = await res.text();
					}
				})
				.catch(() => {});

			await player.loadVideoById(next.youtube);
			await player.playVideo();

			currentSeconds = 0;
			settings.paused = false;

			playing = next;
			song = next;

			return;
		}

		settings.paused = !settings.paused;

		if (settings.paused) {
			await player.pauseVideo();
		} else {
			await player.playVideo();
		}
	}

	export function seekTo(seconds: number) {
		player.seekTo(seconds, true);
	}

	function onSeekClick(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		player.seekTo(lengthSeconds * value, true);
	}

	function onSeekDrag(event: MouseEvent) {
		if (event.buttons !== 1) return;

		onSeekClick(event);
	}

	function onVolumeClick(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		settings.volume = value * maxVolume;
		player.setVolume(settings.volume);
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

	function normalizeIndex(index: number, length: number) {
		return ((index % length) + length) % length;
	}

	function nextRelative(offset: number /*, overflow = true */) {
		if (settings.shuffle === 'on') {
			const nextIndex = Math.floor(Math.random() * songs.length);
			return toggleSong(songs[nextIndex]);
		}

		const currentIndex = songs.findIndex((s) => s.id === song.id);
		const nextIndex = normalizeIndex(currentIndex + offset, songs.length);

		return toggleSong(songs[nextIndex]);
	}

	$effect(() => {
		if (player === undefined) return;

		untrack(() => setup());
	});

	function setup() {
		player.setVolume(settings.volume);

		player.on('stateChange', async (event) => {
			if (event.data === 1) {
				lengthSeconds = await player.getDuration();
				settings.volume = await player.getVolume();
			}

			if (event.data === 0) {
				if (settings.loop === 'one') {
					await player.seekTo(0, true);
					await player.playVideo();
				} else if (settings.loop === 'all') {
					nextRelative(1);
				} else {
					nextRelative(1 /*, false*/);
				}
			}
		});

		setInterval(async () => {
			if (settings.paused) return;

			const seconds = (await player.getCurrentTime()) ?? 0;
			currentSeconds = seconds;
		}, 100);
	}
</script>

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
		<progress class="progress h-1.5 w-20" value={value / 100} max={maxVolume / 100}></progress>
	</button>
{/snippet}

<div class="navbar relative h-36 flex-wrap place-content-center md:h-20 md:flex-nowrap">
	<div class="navbar-start h-16 grow basis-full gap-2 self-start md:basis-auto md:self-auto">
		<img src={url} alt={song.title} sizes="16px" class="h-full rounded-lg" />

		<div>
			<h3 class="text-sm font-semibold">{song.title}</h3>
			<span class="text-sm text-slate-300">
				By
				{#if artist.tiktok}
					<a href="https://www.tiktok.com/@{artist.tiktok}" class="hover:underline">{song.artist}</a
					>
				{:else}
					{song.artist}
				{/if}
			</span>
		</div>

		<div class="ml-auto flex flex-col pr-2 lg:hidden">
			<div class="flex flex-row place-items-center gap-2 place-self-end">
				<span class="text-xs text-slate-300">
					{formatSeconds(currentSeconds)}
				</span>

				<span> / </span>

				<span class="text-xs text-slate-300">
					{formatSeconds(lengthSeconds)}
				</span>
			</div>

			<div class="flex flex-row">
				{@render volume(settings.volume)}
			</div>
		</div>
	</div>

	<div
		class="navbar-end lg:navbar-center w-auto max-w-lg flex-row gap-8 pr-4 lg:w-full lg:flex-col lg:gap-2"
	>
		<div class="flex flex-row gap-4 md:pr-7 lg:pr-0">
			<button
				onclick={() => {
					settings.shuffle = settings.shuffle === 'off' ? 'on' : 'off';
				}}
				class="cursor-pointer text-left transition-all duration-100 ease-in-out"
				class:text-slate-400={settings.shuffle === 'off'}
				class:hover:text-white={settings.shuffle === 'off'}
				class:text-white={settings.shuffle !== 'off'}
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
				onclick={() => toggleSong(song)}
				class="bg-base-content cursor-pointer rounded-full p-2 text-left text-black transition-all duration-100 ease-in-out hover:-m-0.5 hover:p-2.5"
			>
				{#if !settings.paused}
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
					settings.loop =
						settings.loop === 'none' ? 'all' : settings.loop === 'all' ? 'one' : 'none';
				}}
				class="cursor-pointer text-left transition-all duration-100 ease-in-out"
				class:text-slate-400={settings.loop === 'none'}
				class:hover:text-white={settings.loop === 'none'}
				class:text-white={settings.loop !== 'none'}
			>
				{#if settings.loop === 'one'}
					<Repeat1 size="1.3em" />
				{:else}
					<Repeat size="1.3em" />
				{/if}
			</button>

			<button
				onclick={() => (settings.lyrics = !settings.lyrics)}
				class="absolute right-4 bottom-[1.9rem] cursor-pointer self-end text-left transition-all duration-100 ease-in-out lg:hidden"
				class:text-slate-400={!settings.lyrics}
				class:hover:text-white={!settings.lyrics}
				class:text-white={settings.lyrics}
			>
				<MicVocal size="1.3em" />
			</button>
		</div>

		<div class="hidden flex-row place-items-center gap-2 lg:flex lg:w-full">
			<span class="text-xs text-slate-300">
				{formatSeconds(currentSeconds)}
			</span>
			<button
				onmousedown={onSeekClick}
				onmousemove={onSeekDrag}
				class="flex w-full cursor-pointer"
				aria-label="Seek"
			>
				<progress class="progress h-1.5 w-full" value={currentSeconds / lengthSeconds} max={1}
				></progress>
			</button>
			<span class="text-xs text-slate-300">
				{formatSeconds(lengthSeconds)}
			</span>
		</div>
	</div>
	<div class="lg:navbar-end hidden gap-5 pr-4">
		<button
			onclick={() => (settings.lyrics = !settings.lyrics)}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out"
			class:text-slate-400={!settings.lyrics}
			class:hover:text-white={!settings.lyrics}
			class:text-white={settings.lyrics}
		>
			<MicVocal size="1.3em" />
		</button>

		<div class="flex flex-row gap-1">
			{@render volume(settings.volume)}
		</div>
	</div>
</div>

<button
	onmousedown={onSeekClick}
	onmousemove={onSeekDrag}
	class="flex w-full cursor-pointer"
	aria-label="Seek"
>
	<progress
		class="progress square-progress h-2 w-full !rounded-none lg:hidden"
		value={currentSeconds / lengthSeconds}
		max={1}
	></progress>
</button>

<style>
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
