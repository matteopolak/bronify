<script lang="ts">
	import { page } from '$app/state';
	import Controls from '$lib/components/controls.svelte';
	import Cover from '$lib/components/cover.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { artistThumbnail, getArtist, songData } from '$lib/get';
	import type { Song, TrackSettings } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import PlayerFactory from 'youtube-player';
	import type { YouTubePlayer } from 'youtube-player/dist/types';

	let artist = $derived(getArtist(page.params.id));
	let songs = $derived(songData.filter((s) => s.artist === artist.id));

	let srt: string | undefined = $state();
	let settings: TrackSettings = $state({
		paused: true,
		lyrics: false,
		volume: 20,
		loop: 'none',
		shuffle: 'off'
	});
	let currentSeconds = $state(0);

	let playerElement: HTMLDivElement = $state()!;
	let player: YouTubePlayer = $state()!;
	let controls: Controls = $state()!;
	let playing: Song | undefined = $state();

	onMount(() => {
		player = PlayerFactory(playerElement, {
			playerVars: {
				autoplay: 0
			}
		});
	});

	onDestroy(() => {
		player.destroy();
	});
</script>

<div bind:this={playerElement} class="hidden"></div>

{#if srt === undefined || !settings.lyrics}
	<div class="flex w-full flex-col place-items-center py-8">
		<div class="flex max-w-xs flex-row gap-4">
			<div class="relative">
				<img
					loading="lazy"
					src={artistThumbnail(artist.id)}
					alt={artist.id}
					class="h-24 w-24 rounded-lg"
				/>

				<div class="absolute top-2 right-2 flex flex-row gap-1 text-xs md:text-base">
					{#if artist.tiktok}
						<svg
							version="1.1"
							id="Layer_1"
							xmlns="http://www.w3.org/2000/svg"
							x="0px"
							y="0px"
							width="145.6895px"
							height="145.6895px"
							viewBox="0 0 291.379 291.379"
							enable-background="new 0 0 1000 291.379"
							class="h-[1.5em] w-fit"
						>
							<path
								d="M177.083,93.525c18.819,13.441,41.864,21.35,66.755,21.35V77.189c-13.894-2.958-26.194-10.215-35.442-20.309   c-15.83-9.873-27.235-26.161-30.579-45.225h-34.896v191.226c-0.079,22.293-18.18,40.344-40.502,40.344   c-13.154,0-24.84-6.267-32.241-15.975c-13.216-6.667-22.279-20.354-22.279-36.16c0-22.355,18.131-40.48,40.501-40.48   c4.286,0,8.417,0.667,12.292,1.896v-38.098c-48.039,0.992-86.674,40.224-86.674,88.474c0,24.086,9.621,45.921,25.236,61.875   c14.087,9.454,31.045,14.968,49.29,14.968c48.899,0,88.54-39.621,88.54-88.496V93.525L177.083,93.525z"
								fill="currentColor"
							/>
						</svg>
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-1 self-center">
				<div class="flex flex-col">
					<h3 class="text-md line-clamp-1 font-semibold">{artist.id}</h3>
				</div>
			</div>
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
		initialSong={songs[0]}
		{songs}
		bind:lyricsSrt={srt}
		bind:currentSeconds
		bind:settings
		bind:playing
	/>
</div>
