<script lang="ts">
	import '@fontsource-variable/inter';
	import '../app.css';

	import bronify from '$lib/images/bronify.png?enhanced';
	import { player, global, settings, stringFromStorage } from '$lib/player.svelte';
	import Controls from '$lib/components/controls.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { DYNAMIC_HEIGHT_CLASS } from '$lib/constants';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { Capacitor } from '@capacitor/core';

	import { onMount, type Snippet } from 'svelte';
	import {
		ArrowBigDownDash,
		Heart,
		Home,
		Library,
		Menu,
		Music,
		Plus,
		Search
	} from '@lucide/svelte';
	import { shortcut, type ShortcutEventDetail } from '@svelte-put/shortcut';
	import { beforeNavigate, goto } from '$app/navigation';
	import FakeProgress from '$lib/components/fake-progress.svelte';
	import {
		decodePlaylist,
		getStoredPlaylistIds,
		createPlaylist,
		playlists
	} from '$lib/playlist.svelte';
	import type { Playlist } from '$lib/types';
	import { page } from '$app/stores';
	import { debounce } from '$lib/util';
	import ControlsSmall from '$lib/components/controls-small.svelte';
	import { updated } from '$app/state';

	let { children }: { children: Snippet } = $props();
	let audioElement: HTMLAudioElement = $state()!;

	function normalizeIndex(index: number, length: number) {
		return ((index % length) + length) % length;
	}

	function nextRelative(offset: number /*, overflow = true */) {
		if (settings.loop === 'one') {
			return player.toggle(player.track, true);
		}

		if (settings.shuffle === 'on') {
			const nextIndex = Math.floor(Math.random() * player.queue.length);
			return player.toggle(player.queue[nextIndex]);
		}

		const currentIndex = player.queue.findIndex((s) => s.id === player.track.id);
		const nextIndex = normalizeIndex(currentIndex + offset, player.queue.length);

		return player.toggle(player.queue[nextIndex]);
	}

	onMount(() => {
		settings.lyrics = stringFromStorage('lyrics', 'off');
		settings.loop = stringFromStorage('loop', 'none');
		settings.shuffle = stringFromStorage('shuffle', 'off');

		playlists.splice(0, playlists.length);
		playlists.push(
			...(getStoredPlaylistIds()
				.map(decodePlaylist)
				.filter((p) => p) as Playlist[])
		);

		if (playlists.length === 0) {
			const playlist = {
				title: 'LePlaylist',
				tracks: []
			};

			createPlaylist(playlist);
		}
	});

	$effect(() => {
		localStorage.setItem('lyrics', settings.lyrics);
		localStorage.setItem('loop', settings.loop);
		localStorage.setItem('shuffle', settings.shuffle);
	});

	let lastTrackId = player.track.id;

	onMount(() => {
		// if width is < 640px, make lyrics = 'off'
		const query = matchMedia('(max-width: 768px)');

		if (query.matches) {
			settings.lyrics = 'off';
		}

		query.addEventListener('change', (e) => {
			if (e.matches) {
				settings.lyrics = 'off';
			}
		});

		// use existing track
		const searchParams = new URLSearchParams(window.location.search);

		if (searchParams.has('track')) {
			const trackId = searchParams.get('track');

			if (trackId) {
				const track = player.queue.find((s) => s.id === trackId);

				if (track) {
					player.track = track;
					lastTrackId = track.id;
				}
			}
		}

		player.init(audioElement);

		player.audio.onended = () => {
			if (settings.shuffle === 'on' && settings.loop !== 'one') {
				const nextIndex = Math.floor(Math.random() * player.queue.length);
				player.toggle(player.queue[nextIndex]);
			} else {
				nextRelative(1);
			}
		};
	});

	$effect(() => {
		if (lastTrackId === player.track.id) return;
		lastTrackId = player.track.id;

		$page.url.searchParams.set('track', player.track.id);

		goto(`${$page.url.pathname}?${$page.url.searchParams.toString()}`, {
			replaceState: true
		});
	});

	let comingSoonModal: HTMLDialogElement = $state()!;
	let createModal: HTMLDialogElement = $state()!;

	function handleK(detail: ShortcutEventDetail) {
		detail.originalEvent.preventDefault();
		searchInput.focus();
	}

	let searchInput: HTMLInputElement = $state()!;
	let savedLyricsState: 'on' | 'off' = $state('off');
	let lastSearch = $state('');

	$effect(() => {
		if (global.search === lastSearch) return;

		if (!global.search && lastSearch) {
			settings.lyrics = savedLyricsState;
		} else if (global.search && !lastSearch) {
			savedLyricsState = settings.lyrics;
			settings.lyrics = 'off';
		}

		lastSearch = global.search;
	});

	beforeNavigate(({ type, from, to }) => {
		if (
			type === 'leave' ||
			(from?.url.pathname === to?.url.pathname && from?.url?.search === to?.url?.search)
		)
			return;

		if (comingSoonModal.open) {
			comingSoonModal.close();
		}

		settings.lyrics = 'off';
	});

	const DEFAULT_TITLE = 'Bronify: LeMusic for everyone';

	let title = $derived(player.paused ? DEFAULT_TITLE : `${player.track.title} | Bronify`);

	function onPlaylistAdd() {
		const playlist = createPlaylist({
			title: `Playlist #${playlists.length + 1}`,
			tracks: []
		});

		goto(`/playlists/${playlist.id}`);
	}

	let search = $state('');

	const updateGlobalSearch = debounce(() => {
		global.search = search;
	}, 300);

	$effect(() => {
		if (search === '') {
			global.search = '';
			return;
		}

		updateGlobalSearch();
	});

	let insideApp = $state(true);

	onMount(() => {
		if (window.matchMedia('(display-mode: standalone)').matches) {
			insideApp = true;
		} else if (window.isTauri?.() || '__TAURI__' in window) {
			insideApp = true;
		} else if (Capacitor.isNativePlatform()) {
			insideApp = true;
		} else {
			insideApp = false;
		}
	});

	$effect(() => {
		document.documentElement.setAttribute('data-sveltekit-reload', updated ? 'on' : 'off');
	});
</script>

<svelte:head>
	<link rel="icon" href={bronify.img.src} />
	<link rel="apple-touch-icon" href={bronify.img.src} />

	<!-- Manifest -->
	<link rel="manifest" href="/manifest.webmanifest" />

	<meta
		name="description"
		content="Bronify is your ultimate playlist of songs inspired by LeBron James — from hip hop shout-outs to iconic game-day anthems. Discover the music behind the King."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<title>{title}</title>
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

<audio bind:this={audioElement} hidden></audio>

<FakeProgress />

<div class="h-screen">
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

	{#if $page.url.pathname !== '/immersive'}
		<div class="navbar px-4 md:hidden">
			<div class="navbar-start">
				<a
					href="/"
					class="flex flex-row place-items-center gap-2 font-bold"
					aria-label="Bronify Home"
				>
					<span class="text-red-500">
						<Heart size="1.5em" fill="currentColor" />
					</span>
					bronify.love
				</a>
			</div>

			<div class="navbar-end gap-2">
				{#if !insideApp}
					<a class="btn btn-md" href="/app" aria-label="Install app">
						<ArrowBigDownDash size="1.2em" fill="currentColor" />
						Install App
					</a>
				{/if}
			</div>
		</div>

		<div class="md:navbar hidden px-4 md:px-12">
			<div class="md:navbar-start hidden">
				<a
					href="/"
					class="flex flex-row place-items-center gap-2 font-bold"
					aria-label="Bronify Home"
				>
					<span class="text-red-500">
						<Heart size="1.5em" fill="currentColor" />
					</span>
					bronify.love
				</a>
			</div>

			<div class="navbar-center mx-auto w-full max-w-lg gap-2 md:mx-0 md:w-auto lg:w-full">
				<label
					for="sidebar"
					class="bg-base-200 hover:bg-base-200/80 aspect-square rounded-full p-3 md:hidden"
				>
					<Menu size="1.5em" fill="currentColor" />
				</label>

				<a
					href="/"
					aria-label="Bronify Home"
					class="bg-base-200 hover:bg-base-200/80 aspect-square rounded-full p-3"
				>
					<Home size="1.5em" fill="currentColor" />
				</a>

				<label class="input input-lg w-full border-none">
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
						placeholder="Search artist, title, and lyrics"
						autocomplete="off"
					/>
					<kbd class="kbd kbd-sm">⌘</kbd>
					<kbd class="kbd kbd-sm">K</kbd>
				</label>
			</div>

			<div class="md:navbar-end hidden gap-2">
				{#if !insideApp}
					<a class="btn btn-md" href="/app" aria-label="Install app">
						<ArrowBigDownDash size="1.2em" fill="currentColor" />
						Install App
					</a>
				{/if}
			</div>
		</div>
	{/if}

	<Sidebar id="sidebar">
		{#if player.lyrics && settings.lyrics === 'on' && $page.url.pathname !== '/immersive'}
			<div
				class="flex w-full overflow-y-auto rounded-lg py-8 {DYNAMIC_HEIGHT_CLASS} sm:pb-0 md:place-content-center"
				style="background-color: {player.track.colour}"
			>
				<Lyrics
					lyrics={player.lyrics}
					currentTime={player.currentSeconds}
					onLyricClick={(start) => player.seek(start)}
				/>
			</div>
		{:else}
			<div
				class="bg-base-200 overflow-y-auto {DYNAMIC_HEIGHT_CLASS} sm:pb-0"
				class:rounded-lg={$page.url.pathname !== '/immersive'}
				class:pb-32={$page.url.pathname !== '/immersive'}
			>
				{@render children()}
			</div>
		{/if}
	</Sidebar>

	<div class="bg-base-100 border-base-200 hidden md:block">
		<Controls maxVolume={0.5} />
	</div>

	{#if $page.url.pathname !== '/immersive'}
		<div
			class="fixed bottom-[4.5em] z-20 ml-2 w-[calc(100vw-1em)] rounded-lg p-2 md:hidden"
			style="background-color: {player.track.colour}"
		>
			<ControlsSmall />
		</div>
	{/if}
</div>

<dialog id="create-modal" class="modal px-0" bind:this={createModal}>
	<form
		class="modal-box bg-base-200 flex w-[calc(100vw-1em)] max-w-full !translate-y-[calc(50vh-7.5em)] flex-col gap-2 rounded-lg p-1"
		method="dialog"
	>
		<button
			class="hover:bg-base-100 flex flex-row justify-items-center gap-3 rounded-lg p-3 transition-all duration-200"
			onclick={onPlaylistAdd}
		>
			<div class="bg-base-300 rounded-full p-4 text-neutral-400">
				<Music size="2em" />
			</div>

			<div class="flex flex-col gap-1 self-center text-left">
				<span class="text-sm font-bold">Playlist</span>
				<span class="text-xs text-neutral-400">Build a playlist with LeSongs</span>
			</div>
		</button>
	</form>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

{#if $page.url.pathname !== '/immersive'}
	<div class="dock z-20 bg-transparent pb-3 text-neutral-400 md:hidden">
		<a href="/" class:active={$page.url.pathname === '/'}>
			<Home />
			<span class="dock-label">Home</span>
		</a>

		<a href="/search" class:active={$page.url.pathname === '/search'}>
			<Search />
			<span class="dock-label">Search</span>
		</a>

		<a href="/library" class:active={$page.url.pathname === '/library'}>
			<Library />
			<span class="dock-label">Your Library</span>
		</a>

		<button onclick={() => createModal.showModal()}>
			<Plus />
			<span class="dock-label">Create</span>
		</button>
	</div>

	<div
		class="from-base-100 pointer-events-none fixed bottom-0 left-0 z-10 h-60 w-full bg-linear-to-t to-transparent md:hidden"
	></div>
{/if}

<style>
	@reference "../app.css";

	.dock-item {
		@apply transition-all duration-100 ease-in-out;
	}

	.active {
		@apply text-white;
	}
</style>
