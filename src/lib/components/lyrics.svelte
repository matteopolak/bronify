<script lang="ts">
	import { player } from '$lib/player.svelte';
	import type { Lyrics } from '$lib/types';
	import { onMount } from 'svelte';

	let {
		lyrics,
		currentTime,
		onLyricClick,
		class: klass = ''
	}: {
		lyrics: Lyrics;
		currentTime: number;
		onLyricClick: (start: number) => void;
		class?: string;
	} = $props();

	let activeIndex = $state(-1);
	let lyricElements: HTMLElement[] = $state([]);

	const OFFSET = 0.5;

	let time = $state(currentTime + OFFSET);
	let lastTime = performance.now();

	$effect(() => {
		let _ = currentTime;
		lastTime = performance.now();
	});

	onMount(() => {
		const interval = setInterval(() => {
			if (player.paused) {
				time = currentTime + OFFSET;
				return;
			}

			// interpolate time
			const now = performance.now();
			const delta = now - lastTime;

			time = currentTime + OFFSET + delta / 1000;
		}, 20);

		return () => {
			clearInterval(interval);
		};
	});

	type Span = {
		start: number;
		end: number;
	};

	function getActiveBlock<T extends Span>(spans: T[], time: number): T | null {
		let left = 0;
		let right = spans.length - 1;
		let mid;

		while (left <= right) {
			mid = Math.floor((left + right) / 2);

			if (spans[mid].start <= time && spans[mid].end >= time) {
				return spans[mid];
			} else if (spans[mid].start > time) {
				right = mid - 1;
			} else {
				left = mid + 1;
			}
		}

		// find last span that starts before time
		for (let i = spans.length - 1; i >= 0; i--) {
			if (spans[i].start <= time && (spans.length === i + 1 || spans[i + 1].start > time)) {
				return spans[i];
			}
		}

		// if no span is found, return the first one
		return null;
	}

	$effect(() => {
		const line = getActiveBlock(lyrics, time) ?? { words: [], start: 0 };
		const word = getActiveBlock(line.words, time - line.start) ?? { index: -1 };

		if (word.index !== activeIndex) {
			activeIndex = word.index;
		}
	});

	let lastActiveIndex = -1;

	$effect(() => {
		if (activeIndex === lastActiveIndex) {
			return;
		}
		lastActiveIndex = activeIndex;
		const activeElement = lyricElements[activeIndex] ?? lyricElements[0];

		activeElement?.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	});

	$effect(() => {
		if (lyricElements.length === 0) {
			return;
		}

		lyricElements[0]?.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	});
</script>

<!-- Scrollable lyrics container -->
<div
	class="hide-scrollbar flex w-full max-w-2xl flex-col items-start space-y-2 overflow-y-visible text-2xl font-bold text-white/50 sm:space-y-4 sm:px-4 sm:text-4xl {klass}"
>
	<!-- 50vh of padding on top and bottom -->
	<div class="p-[25vh]"></div>

	{#each lyrics as lyric (lyric.start)}
		<span class="line">
			{#each lyric.words as word (word.start)}
				<button
					class:active={word.index <= activeIndex}
					class="word"
					bind:this={lyricElements[word.index]}
					onclick={() => onLyricClick(word.start - OFFSET + lyric.start)}
				>
					{word.text}
				</button>
			{/each}
		</span>
	{/each}

	<!-- 50vh of padding on top and bottom -->
	<div class="p-[25vh]"></div>
</div>

<style>
	@reference "../../app.css";

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.active {
		@apply text-white/90;
	}

	.word {
		@apply inline-block cursor-pointer text-left whitespace-pre-wrap transition-all duration-300 ease-in-out hover:text-white/90 sm:leading-9;
	}

	.line {
		@apply text-left leading-6 sm:leading-normal;
	}
</style>
