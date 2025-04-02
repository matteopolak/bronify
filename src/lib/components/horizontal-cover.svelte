<script lang="ts">
	import { goto } from '$app/navigation';
	import { trackThumbnail, getArtist, getArtistDisplayName } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import { addToPlaylist, playlists, removeFromPlaylist } from '$lib/playlist.svelte';
	import type { Playlist, Track } from '$lib/types';
	import { formatSeconds } from '$lib/util';
	import { Pause, Play, Plus, Trash } from '@lucide/svelte';

	let {
		track,
		number,
		onClick,
		playlist = $bindable()
	}: { track: Track; number: number; onClick: () => void; playlist?: Playlist } = $props();

	let url = $derived(trackThumbnail(track.id));
	let artist = $derived(getArtist(track.artist));
	let active = $derived(player.track.id === track.id);

	let anchor: HTMLAnchorElement = $state()!;
</script>

<button
	class="group card flex h-16 w-full cursor-pointer flex-row gap-2 rounded-md p-2 pr-4 text-left transition-all duration-100"
	onclick={(e) => {
		if (e.target !== anchor) {
			onClick();
		}
	}}
	aria-label="Play track"
	class:active
	class:not-active={!active}
>
	<div
		class="aspect-square w-12 place-items-center justify-center"
		class:flex={!active}
		class:group-hover:hidden={!active}
		class:hidden={active}
	>
		<span class="text-md font-mono text-neutral-300">{number}</span>
	</div>

	<div
		class="aspect-square w-12 place-items-center justify-center"
		class:hidden={!active}
		class:group-hover:flex={!active}
		class:flex={active}
	>
		{#if player.paused || player.track.id !== track.id}
			<Play fill="currentColor" size="1em" />
		{:else}
			<Pause fill="currentColor" size="1em" />
		{/if}
	</div>

	<img
		loading="lazy"
		src={url}
		alt={track.title}
		class="h-12 w-12 rounded-lg brightness-50 sm:brightness-100"
	/>

	<div class="flex flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-1 font-semibold">{track.title}</h3>
			<span class="text-sm text-slate-300">
				<a
					href="/artists/{getArtistDisplayName(artist)}"
					class="hover:underline"
					bind:this={anchor}
				>
					{getArtistDisplayName(artist)}
				</a>
			</span>
		</div>
	</div>

	<span class="ml-auto translate-y-0.5 self-center font-mono text-sm text-slate-300">
		{formatSeconds(track.durationSeconds)}
	</span>

	{#if playlist}
		<div
			tabindex="0"
			role="button"
			class="btn btn-ghost btn-square m-1 text-slate-400 transition-all duration-300 ease-in-out hover:text-white"
			onclick={(e) => {
				e.stopPropagation();
				const newPlaylist = removeFromPlaylist(playlist, track);
				const id = newPlaylist.id!;
				goto(`/playlists/${id}`, {
					replaceState: true
				});
			}}
			onkeydown={() => {}}
		>
			<Trash size="1.2em" fill="currentColor" />
		</div>
	{:else}
		<div
			class="dropdown dropdown-end"
			role="button"
			tabindex={0}
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<div
				tabindex="0"
				role="button"
				class="btn btn-ghost btn-square m-1 text-slate-400 transition-all duration-300 ease-in-out hover:text-white"
			>
				<Plus />
			</div>
			<ul class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
				<li>
					{#each playlists as playlist (playlist.id)}
						<div
							class="flex flex-row place-items-center gap-2"
							role="button"
							onclick={(e) => {
								e.stopPropagation();
								addToPlaylist(playlist, track);
							}}
							onkeydown={() => {}}
							tabindex="0"
						>
							Add to <span class="font-bold">{playlist.title}</span>
						</div>
					{/each}
				</li>
			</ul>
		</div>
	{/if}
</button>

<style>
	@reference '../../app.css';

	.active {
		@apply bg-base-300/50;
	}

	.not-active {
		@apply hover:bg-base-300/50;
	}
</style>
