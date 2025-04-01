<script lang="ts">
	import { formatSeconds } from '$lib/util';
	import { player, settings } from '$lib/player.svelte';
	import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from '@lucide/svelte';

	function onSeekClick(event: MouseEvent) {
		const progress = event.target as HTMLProgressElement;
		const value = event.offsetX / progress.offsetWidth;

		player.seek(player.duration * value);
	}

	function onSeekDrag(event: MouseEvent) {
		if (event.buttons !== 1) return;

		onSeekClick(event);
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
</script>

<div class="relative flex w-screen flex-col place-content-center gap-4 px-6 pb-14">
	<div class="flex flex-row flex-wrap place-content-between gap-1">
		<button
			onmousedown={onSeekClick}
			onmousemove={onSeekDrag}
			class="flex w-full shrink-0 cursor-pointer"
			aria-label="Seek"
		>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={player.duration === 0 ? 0 : player.currentSeconds / player.duration}
				class="h-1 w-full appearance-none rounded-lg border-none"
			/>
		</button>

		<span class="text-xs text-neutral-300">
			{formatSeconds(player.currentSeconds)}
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

<style>
	/*Chrome*/
	@media screen and (-webkit-min-device-pixel-ratio: 0) {
		input[type='range']::-webkit-slider-runnable-track {
			-webkit-appearance: none;
			border-radius: 9999px;
			color: #ffffff;
		}

		input[type='range']::-webkit-slider-thumb {
			appearance: none;
			width: 12px;
			height: 12px;
			background: white;
			border-radius: 50%;
			cursor: pointer;
			margin-top: -5px; /* align thumb with track */
		}
	}
	/** FF*/
	input[type='range']::-moz-range-progress {
		background-color: #ffffff;
		border-radius: 9999px;
	}
	input[type='range']::-moz-range-track {
		background-color: #9a905d;
		border-radius: 9999px;
	}
	/* IE*/
	input[type='range']::-ms-fill-lower {
		background-color: #43e5f7;
	}
	input[type='range']::-ms-fill-upper {
		background-color: #9a905d;
	}

	input[type='range']::-moz-range-thumb {
		width: 12px;
		height: 12px;
		background: white;
		border: transparent;
		border-radius: 50%;
		cursor: pointer;
	}
</style>
