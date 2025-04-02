<script lang="ts">
	import { formatSeconds } from '$lib/util';
	import { player, settings } from '$lib/player.svelte';
	import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from '@lucide/svelte';
	import ProgressBar from './progress-bar.svelte';

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

	let currentSeconds = $state(player.currentSeconds);
</script>

<div class="relative flex w-screen flex-col place-content-center gap-4 px-6 pb-20">
	<div class="flex flex-row flex-wrap place-content-between gap-3">
		<ProgressBar bind:currentSeconds class="shrink-0" />

		<span class="text-xs text-neutral-300">
			{formatSeconds(currentSeconds)}
		</span>
		<span class="ml-auto text-xs text-neutral-300">
			{formatSeconds(player.duration)}
		</span>
	</div>

	<div class="flex flex-row place-content-between gap-4 md:pr-7 lg:pr-0">
		<button
			onclick={() => {
				settings.shuffle = settings.shuffle === 'off' ? 'on' : 'off';
			}}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out"
			class:text-neutral-400={settings.shuffle === 'off'}
			class:hover:text-white={settings.shuffle === 'off'}
			class:text-white={settings.shuffle !== 'off'}
		>
			<Shuffle size="2.2em" />
		</button>

		<button
			onclick={() => nextRelative(-1)}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out hover:text-white"
		>
			<SkipBack fill="currentColor" size="2.2em" />
		</button>

		<button
			onclick={() => player.toggle(player.track)}
			class="bg-base-content cursor-pointer rounded-full p-4 text-left text-black transition-all duration-100 ease-in-out hover:-m-1 hover:p-5"
		>
			{#if player.paused}
				<Play fill="currentColor" size="1.8em" />
			{:else}
				<Pause fill="currentColor" size="1.8em" />
			{/if}
		</button>

		<button
			onclick={() => nextRelative(1)}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out hover:text-white"
		>
			<SkipForward fill="currentColor" size="2.2em" />
		</button>

		<button
			onclick={() => {
				settings.loop = settings.loop === 'none' ? 'all' : settings.loop === 'all' ? 'one' : 'none';
			}}
			class="cursor-pointer text-left transition-all duration-100 ease-in-out"
			class:text-neutral-400={settings.loop === 'none'}
			class:hover:text-white={settings.loop === 'none'}
			class:text-white={settings.loop !== 'none'}
		>
			{#if settings.loop === 'one'}
				<Repeat1 size="2.2em" />
			{:else}
				<Repeat size="2.2em" />
			{/if}
		</button>
	</div>
</div>
