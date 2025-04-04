<script lang="ts">
	import { player } from '$lib/player.svelte';

	let {
		currentSeconds = $bindable(),
		square = false,
		class: klass = ''
	}: {
		currentSeconds: number;
		square?: boolean;
		class?: string;
	} = $props();

	$effect(() => {
		if (!dragging) currentSeconds = player.currentSeconds;
	});

	let dragging = $state(false);
	let paused = $state(false);

	let input: HTMLInputElement;
</script>

<div class="relative flex w-full cursor-pointer {klass}" aria-label="Seek">
	<input
		type="range"
		min={0}
		max={player.duration}
		step={0.1}
		bind:value={currentSeconds}
		bind:this={input}
		oninput={() => {
			player.seek(currentSeconds);
		}}
		onmousedown={() => {
			paused = player.paused;
			player.pause();
			dragging = true;
		}}
		onmouseup={() => {
			player.seek(currentSeconds);
			dragging = false;
			if (!paused) player.play();
		}}
		ontouchstart={() => {
			paused = player.paused;
			player.pause();
			dragging = true;
		}}
		ontouchcancel={() => {
			player.seek(currentSeconds);
			dragging = false;
			if (!paused) player.play();
		}}
		ontouchend={() => {
			player.seek(currentSeconds);
			dragging = false;
			if (!paused) player.play();
		}}
		class="h-1 w-full appearance-none rounded-lg border-none"
	/>

	<div
		class="pointer-events-none absolute top-0 left-0 h-1 w-full bg-white"
		class:rounded-lg={!square}
		class:rounded-l-lg={square}
		style="width: {(currentSeconds / player.duration) * 100}%"
	></div>
</div>

<style>
	@reference "../../app.css";

	input[type='range'] {
		@apply cursor-pointer bg-slate-300/50;

		padding: 8px 0; /* increases hitbox */
		margin: -6px 0; /* negates visual effect */
		height: 8px; /* track height */
		background: transparent;
	}

	input[type='range']::-webkit-slider-runnable-track {
		@apply h-1 w-full rounded-full bg-slate-300/50;
	}

	input[type='range']::-webkit-slider-thumb {
		@apply h-3 w-3 cursor-pointer appearance-none rounded-full border-transparent bg-white;
		margin-top: -2px; /* offset the thumb a bit higher */
	}

	input[type='range']::-moz-range-track {
		@apply h-1 w-full rounded-full bg-slate-300/50;
	}

	input[type='range']::-moz-range-thumb {
		@apply h-3 w-3 cursor-pointer rounded-full border-transparent bg-white;
	}

	input[type='range']::-webkit-slider-thumb {
		@apply h-2 w-2 cursor-pointer appearance-none rounded-full bg-white;
	}

	input[type='range']::-moz-range-thumb {
		@apply h-3 w-3 cursor-pointer rounded-full bg-white;
	}

	/* When using `.square`, the sides of the progress should not be rounded (but the actual bar on the inside should still be) */
	.square input[type='range'] {
		@apply rounded-none;
	}

	.square input[type='range']::-moz-range-track {
		@apply rounded-none;
	}
</style>
