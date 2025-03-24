<script lang="ts">
	let { srt, currentTime } = $props<{
		srt: string;
		currentTime: number;
	}>();

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
	let activeIndex = $state(0);
	let lyricsContainer: HTMLDivElement;

	$effect(() => {
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
			const activeElement = document.querySelector('.active');

			if (activeElement && lyricsContainer) {
				lyricsContainer.scrollTo({
					top:
						activeElement.offsetTop -
						lyricsContainer.clientHeight / 2 +
						activeElement.clientHeight / 2,
					behavior: 'smooth'
				});
			}
		}
	});
</script>

<!-- Scrollable lyrics container -->
<div
	bind:this={lyricsContainer}
	class="pointer-events-auto h-[50vh] max-w-lg space-y-4 overflow-y-auto text-3xl font-bold text-slate-400"
>
	{#each lyrics as lyric, i (lyric.start)}
		<p
			id="lyric-{i}"
			class:text-white={i === activeIndex}
			class="leading-9 transition-all duration-300 ease-in-out"
		>
			{lyric.text}
		</p>
	{/each}
</div>
