<script lang="ts">
	import { shortcut, type ShortcutEventDetail } from '@svelte-put/shortcut';
	import Device from 'svelte-device-info';

	import { getArtist, getArtistDisplayName, trackThumbnail } from '$lib/get';
	import { formatSeconds } from '$lib/util';
	import { player, settings } from '$lib/player.svelte';
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
	import ProgressBar from './progress-bar.svelte';
	import Artists from './artists.svelte';

	let {
		maxVolume = 0.5
	}: {
		maxVolume: number;
	} = $props();

	let url = $derived(trackThumbnail(player.track.id));

	function onVolumeClick(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		player.volume = value * maxVolume;
	}

	function onVolumeDrag(event: MouseEvent) {
		if (event.buttons !== 1) return;

		onVolumeClick(event);
	}

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

	function handleShortcut(event: CustomEvent<ShortcutEventDetail>) {
		if (Device.isMobile) return;

		// check focused element globally
		const target = event.detail.originalEvent.target;

		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
			return;
		}

		// if the key is " " and the target is not a button, prevent the default action
		if (event.detail.trigger.key === ' ' && !(target instanceof HTMLButtonElement)) {
			event.detail.originalEvent.preventDefault();
		}

		const detail = event.detail;

		switch (detail.trigger.key) {
			case ' ':
				player.toggle(player.track);
				break;
			case 'ArrowLeft':
				nextRelative(-1);
				break;
			case 'ArrowRight':
				nextRelative(1);
				break;
			case 'ArrowUp':
				player.volume = Math.min(player.volume + 0.01, maxVolume);
				break;
			case 'ArrowDown':
				player.volume = Math.max(player.volume - 0.01, 0);
				break;
			case 'm':
				settings.lyrics = settings.lyrics === 'off' ? 'on' : 'off';
				break;
			case 's':
				settings.shuffle = settings.shuffle === 'off' ? 'on' : 'off';
				break;
			case 'r':
				settings.loop = settings.loop === 'none' ? 'all' : settings.loop === 'all' ? 'one' : 'none';
				break;
			case 'l':
				settings.loop = settings.loop === 'none' ? 'one' : settings.loop === 'one' ? 'all' : 'none';
				break;
			case 'Escape':
				settings.lyrics = 'off';
				break;
		}
	}

	let currentSeconds = $state(player.currentSeconds);
</script>

<svelte:window
	use:shortcut={{
		type: 'keydown',
		trigger: [
			{ key: ' ' },
			{ key: 'ArrowLeft' },
			{ key: 'ArrowRight' },
			{ key: 'ArrowUp' },
			{ key: 'ArrowDown' },
			{ key: 'm' },
			{ key: 's' },
			{ key: 'r' },
			{ key: 'l' },
			{ key: 'Escape' }
		]
	}}
	onshortcut={handleShortcut}
/>

{#snippet volume(value: number)}
	{#if value > 0.5}
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
		<progress class="progress h-1.5 w-20" {value} max={maxVolume}></progress>
	</button>
{/snippet}

<div class="navbar relative h-30 flex-wrap place-content-center md:h-20 md:flex-nowrap">
	<div class="navbar-start h-16 grow basis-full gap-2 self-start md:basis-auto md:self-auto">
		<img src={url} alt={player.track.title} sizes="16px" class="h-full rounded-lg" />

		<div>
			<h3 class="text-sm font-semibold">{player.track.title}</h3>
			<span class="text-sm text-slate-300">
				<Artists artistIds={player.track.artists} />
			</span>
		</div>

		<div class="ml-auto flex flex-col pr-2 lg:hidden">
			<div class="flex flex-row place-items-center gap-2 place-self-end">
				<span class="text-xs text-slate-300">
					{formatSeconds(player.currentSeconds)}
				</span>

				<span> / </span>

				<span class="text-xs text-slate-300">
					{formatSeconds(player.duration)}
				</span>
			</div>

			<div class="flex flex-row">
				{@render volume(player.volume)}
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
				onclick={() => player.toggle(player.track)}
				class="bg-base-content cursor-pointer rounded-full p-2 text-left text-black transition-all duration-100 ease-in-out hover:-m-0.5 hover:p-2.5"
			>
				{#if player.paused}
					<Play fill="currentColor" size="1em" />
				{:else}
					<Pause fill="currentColor" size="1em" />
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
				onclick={() => (settings.lyrics = settings.lyrics === 'off' ? 'on' : 'off')}
				class="absolute right-4 bottom-[1.2rem] cursor-pointer self-end text-left transition-all duration-100 ease-in-out md:bottom-[1.9rem] lg:hidden"
				class:text-slate-400={settings.lyrics === 'off'}
				class:hover:text-white={settings.lyrics === 'off'}
				class:text-white={settings.lyrics === 'on'}
			>
				<MicVocal size="1.3em" />
			</button>
		</div>

		<div class="hidden flex-row place-items-center gap-2 lg:flex lg:w-full">
			<span class="w-6 shrink-0 text-xs text-neutral-400">
				{formatSeconds(player.currentSeconds)}
			</span>

			<ProgressBar bind:currentSeconds />

			<span class="w-6 shrink-0 text-xs text-neutral-400">
				{formatSeconds(player.duration)}
			</span>
		</div>
	</div>
	<div class="lg:navbar-end hidden gap-5 pr-4">
		<button
			onclick={() => (settings.lyrics = settings.lyrics === 'off' ? 'on' : 'off')}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out"
			class:text-slate-400={settings.lyrics === 'off'}
			class:hover:text-white={settings.lyrics === 'off'}
			class:text-white={settings.lyrics === 'on'}
		>
			<MicVocal size="1.3em" />
		</button>

		<div class="flex flex-row gap-1">
			{@render volume(player.volume)}
		</div>
	</div>
</div>

<ProgressBar bind:currentSeconds class="lg:hidden" square />
