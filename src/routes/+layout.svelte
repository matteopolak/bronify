<script lang="ts">
	import '../app.css';

	import bronify from '$lib/images/bronify.png?enhanced';
	import { player, global, settings } from '$lib/player.svelte';
	import Controls from '$lib/components/controls.svelte';
	import Lyrics from '$lib/components/lyrics.svelte';
	import { DYNAMIC_HEIGHT_CLASS } from '$lib/constants';
	import Sidebar from '$lib/components/sidebar.svelte';

	import { onMount, type Snippet } from 'svelte';
	import { Heart, Home, Menu } from '@lucide/svelte';
	import { shortcut, type ShortcutEventDetail } from '@svelte-put/shortcut';

	let { children }: { children: Snippet } = $props();
	let audioElement: HTMLAudioElement = $state()!;

	function normalizeIndex(index: number, length: number) {
		return ((index % length) + length) % length;
	}

	function nextRelative(offset: number /*, overflow = true */) {
		if (settings.shuffle === 'on') {
			const nextIndex = Math.floor(Math.random() * player.queue.length);
			return player.toggle(player.queue[nextIndex]);
		}

		if (settings.loop === 'one') {
			return player.toggle(player.track, true);
		}

		const currentIndex = player.queue.findIndex((s) => s.id === player.track.id);
		const nextIndex = normalizeIndex(currentIndex + offset, player.queue.length);

		return player.toggle(player.queue[nextIndex]);
	}

	onMount(() => {
		player.init(audioElement);

		player.audio.onended = () => {
			if (settings.shuffle === 'on') {
				const nextIndex = Math.floor(Math.random() * player.queue.length);
				player.toggle(player.queue[nextIndex]);
			} else {
				nextRelative(1);
			}
		};
	});

	let comingSoonModal: HTMLDialogElement = $state()!;

	function handleK(detail: ShortcutEventDetail) {
		detail.originalEvent.preventDefault();
		searchInput.focus();
	}

	let searchInput: HTMLInputElement = $state()!;
	let lyricsWasEnabled = $state(false);
	let lastSearch = $state('');

	$effect(() => {
		if (global.search === lastSearch) return;

		if (!global.search && lastSearch) {
			settings.lyrics = lyricsWasEnabled;
		} else if (global.search && !lastSearch) {
			lyricsWasEnabled = settings.lyrics;
			settings.lyrics = false;
		}

		lastSearch = global.search;
	});

	function pastelColorFromString(str: string) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // Convert to 32bit integer
		}

		const hue = Math.abs(hash) % 360;
		const saturation = 70 + (Math.abs(hash) % 10);
		const lightness = 45 + (Math.abs(hash) % 5);

		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	let lyricsBackgroundColor = $derived(pastelColorFromString(player.track.id));
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
/>

<audio bind:this={audioElement} hidden />

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
			<button class="btn btn-md" onclick={() => comingSoonModal.showModal()}>Sign in</button>
			<button class="btn btn-md btn-primary" onclick={() => comingSoonModal.showModal()}
				>Sign up</button
			>
		</div>
	</div>

	<div class="navbar px-4 md:px-12">
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
					bind:value={global.search}
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

	<Sidebar id="sidebar">
		{#if player.lyrics && settings.lyrics}
			<div
				class="flex w-full justify-center overflow-y-auto rounded-lg py-8 {DYNAMIC_HEIGHT_CLASS}"
				style="background-color: {lyricsBackgroundColor}"
			>
				<Lyrics
					lyrics={player.lyrics}
					currentTime={player.currentSeconds}
					onLyricClick={(start) => player.seek(start)}
				/>
			</div>
		{:else}
			<div class="bg-base-200 overflow-y-auto rounded-lg {DYNAMIC_HEIGHT_CLASS}">
				{@render children()}
			</div>
		{/if}
	</Sidebar>

	<div class="bg-base-100 border-base-200">
		<Controls maxVolume={0.5} />
	</div>
</div>
