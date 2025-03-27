<script lang="ts">
	import { onMount } from 'svelte';

	let {
		lyrics: srt,
		currentTime,
		onLyricClick
	}: {
		lyrics: string;
		currentTime: number;
		onLyricClick: (start: number) => void;
	} = $props();

	function parseSRT(srt: string) {
		const regex =
			/(\d+)\s+(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})\s+([\s\S]*?)(?=\r?\n\r?\n|[\n\r]*$)/g;
		let matches;
		let parsedLyrics = [];

		while ((matches = regex.exec(srt)) !== null) {
			const start =
				Number(matches[2]) * 3600 +
				Number(matches[3]) * 60 +
				Number(matches[4]) +
				Number(matches[5]) / 1000;
			const end =
				Number(matches[6]) * 3600 +
				Number(matches[7]) * 60 +
				Number(matches[8]) +
				Number(matches[9]) / 1000;
			const text = matches[10].replace(/\n/g, ' ');

			parsedLyrics.push({ start, end, text });
		}

		return parsedLyrics;
	}

	let lyrics = $derived(parseSRT(srt));
	let activeIndex = $state(-1);
	let lyricsContainer: HTMLDivElement;
	let lyricElements: HTMLElement[] = $state([]);

	$effect(() => {
		if (currentTime === -1) {
			activeIndex = -1;
			// scroll so first lyric is at the top
			lyricsContainer.scrollTo({
				top: lyricElements[0].offsetTop,
				behavior: 'smooth'
			});
			return;
		}

		let lastActiveIndex = activeIndex;

		// Binary search to find active lyric
		let left = 0;
		let right = lyrics.length - 1;
		let mid;

		while (left <= right) {
			mid = Math.floor((left + right) / 2);

			if (lyrics[mid].start <= currentTime && lyrics[mid].end >= currentTime) {
				activeIndex = mid;
				break;
			} else if (lyrics[mid].start > currentTime) {
				right = mid - 1;
			} else {
				left = mid + 1;
			}
		}

		if (lyrics[0].start > currentTime) {
			activeIndex = 0;
		}

		if (lyrics[lyrics.length - 1].end < currentTime) {
			activeIndex = lyrics.length - 1;
		}

		if (lastActiveIndex !== activeIndex) {
			// Scroll smoothly in the parent container instead of jumping
			const activeElement = lyricElements[activeIndex];

			// scroll to the line such that it's in the middle of the container
			lyricsContainer.scrollTo({
				top: activeElement.offsetTop - lyricsContainer.clientHeight / 2 + 100,
				behavior: 'smooth'
			});
		}
	});

	onMount(() => {
		document.documentElement.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});
</script>

<!-- Scrollable lyrics container -->
<div
	bind:this={lyricsContainer}
	class="hide-scrollbar h-screen max-w-lg space-y-4 overflow-y-scroll px-4 py-4 text-2xl font-bold text-white/70 md:text-3xl"
>
	<div class="pt-[50vh]"></div>

	{#each lyrics as lyric, i (lyric.start)}
		<button
			id="lyric-{i}"
			class:text-white={i === activeIndex}
			class="block cursor-pointer text-left leading-9 transition-all duration-300 ease-in-out hover:text-white"
			bind:this={lyricElements[i]}
			onclick={() => onLyricClick(lyric.start)}
		>
			{lyric.text}
		</button>
	{/each}

	<div class="pt-[50vh]"></div>
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
