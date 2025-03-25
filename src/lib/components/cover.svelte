<script lang="ts">
	import { songThumbnail, getArtist } from '$lib/get';
	import type { Song } from '$lib/types';
	import { MicVocal, Pause, Play } from '@lucide/svelte';

	let { song, playing, onClick }: { song: Song; playing: boolean; onClick: () => void } = $props();

	let url = $derived(songThumbnail(song.id));
	let artist = $derived(getArtist(song.artist));
</script>

<button
	class="group card hover:bg-base-200 flex h-28 w-auto cursor-pointer flex-row gap-2 p-2 text-left transition-all duration-100 sm:h-auto sm:flex-col"
	onclick={onClick}
	aria-label="Play song"
>
	<div class="relative">
		<img
			loading="lazy"
			src={url}
			alt={song.title}
			class="h-24 w-24 rounded-lg brightness-50 sm:h-auto sm:w-auto sm:brightness-100"
		/>

		<!-- Various badges (top right) like YouTube, Spotify, lyrics support -->
		<div class="absolute top-2 left-2 flex flex-row gap-1 text-xs md:text-base">
			{#if song.lyrics}
				<MicVocal size="1.2em" />
			{/if}
		</div>

		<div class="absolute top-2 right-2 flex flex-row gap-1 text-xs md:text-base">
			<a
				href="https://youtube.com/watch?v=${song.youtube}"
				aria-label="YouTube"
				onclick={(e) => e.stopPropagation()}
			>
				<svg
					width="313.23315mm"
					height="216.02286mm"
					viewBox="0 0 313.23315 216.02286"
					version="1.1"
					id="svg5"
					xml:space="preserve"
					xmlns="http://www.w3.org/2000/svg"
					class="h-[1.2em] w-fit"
				>
					<g id="layer1" transform="translate(-54.079375,-5.2758072)">
						<path
							d="m 210.53177,221.29866 c 0,0 98.12514,0 122.46443,-6.48069 13.70449,-3.6724 24.01093,-14.2575 27.62825,-27.32688 6.68807,-23.97854 6.68807,-74.41988 6.68807,-74.41988 0,0 0,-50.117297 -6.68807,-73.879819 C 357.00713,25.79798 346.70069,15.42887 332.9962,11.864515 308.65691,5.2758072 210.53177,5.2758072 210.53177,5.2758072 c 0,0 -97.9062,0 -122.135976,6.5887078 -13.485335,3.564355 -24.010529,13.933465 -27.847831,27.326876 -6.468588,23.762522 -6.468588,73.879819 -6.468588,73.879819 0,0 0,50.44134 6.468588,74.41988 3.837302,13.06938 14.362496,23.65448 27.847831,27.32688 24.229776,6.48069 122.135976,6.48069 122.135976,6.48069 z"
							fill="currentColor"
							id="path1412"
							style="stroke-width:0.0208149"
							clip-path="none"
						/>
						<path
							d="M 259.30109,113.28723 178.29251,67.382379 v 91.809711 z"
							fill="#000000"
							id="path1414"
							style="stroke-width:0.0208149"
							clip-path="none"
						/>
					</g>
				</svg>
			</a>

			{#if song.spotify}
				<a
					href="https://open.spotify.com/track/${song.spotify}"
					aria-label="Spotify"
					onclick={(e) => e.stopPropagation()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="168px"
						width="168px"
						version="1.1"
						viewBox="0 0 168 168"
						class="size-[1.2em]"
					>
						<path
							fill="currentColor"
							d="m83.996 0.277c-46.249 0-83.743 37.493-83.743 83.742 0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l0.001-0.004zm38.404 120.78c-1.5 2.46-4.72 3.24-7.18 1.73-19.662-12.01-44.414-14.73-73.564-8.07-2.809 0.64-5.609-1.12-6.249-3.93-0.643-2.81 1.11-5.61 3.926-6.25 31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-0.903-8.148-4.35-1.04-3.453 0.907-7.093 4.354-8.143 30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-0.001zm0.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219-1.254-4.14 1.08-8.513 5.221-9.771 29.581-8.98 78.756-7.245 109.83 11.202 3.73 2.209 4.95 7.016 2.74 10.733-2.2 3.722-7.02 4.949-10.73 2.739z"
						/>
					</svg>
				</a>
			{/if}
		</div>

		<!-- Play button -->
		<div
			class="sm:bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3.5 text-left text-white transition-all duration-100 ease-in-out group-hover:opacity-100 sm:top-auto sm:right-2 sm:bottom-2 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:text-black sm:opacity-0 sm:hover:right-[0.45rem] sm:hover:bottom-[0.45rem] sm:hover:p-[0.925rem]"
		>
			{#if playing}
				<Pause fill="currentColor" size="1.5em" />
			{:else}
				<Play fill="currentColor" size="1.5em" />
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-1 font-semibold">{song.title}</h3>
			<span class="text-sm text-slate-300">
				By
				{#if artist.tiktok}
					<a
						href="https://www.tiktok.com/@{artist.tiktok}"
						onclick={(e) => e.stopPropagation()}
						class="hover:underline">{song.artist}</a
					>
				{:else}
					{song.artist}
				{/if}
			</span>
		</div>

		<div class="hide-scrollbar mt-auto flex flex-row flex-nowrap gap-1 overflow-x-auto">
			{#each song.tags as tag (tag)}
				<span class="badge badge-ghost break-keep">{tag}</span>
			{/each}
		</div>
	</div>
</button>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
