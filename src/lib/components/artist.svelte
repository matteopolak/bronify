<script lang="ts">
	import { artistThumbnail } from '$lib/get';
	import type { Artist } from '$lib/types';

	let { artist }: { artist: Artist } = $props();
	let url = $derived(artistThumbnail(artist.id));
</script>

<a
	class="group card hover:bg-base-200 flex h-28 w-auto cursor-pointer flex-row gap-2 p-2 text-left transition-all duration-100 sm:h-auto sm:flex-col"
	href="/artists/{artist.id}"
>
	<div class="relative">
		<img
			loading="lazy"
			src={url}
			alt={artist.id}
			class="h-24 w-24 rounded-lg brightness-50 sm:h-auto sm:w-auto sm:brightness-100"
		/>

		<div class="absolute top-2 right-2 flex flex-row gap-1 text-xs md:text-base">
			{#if artist.tiktok}
				<svg
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					x="0px"
					y="0px"
					width="145.6895px"
					height="145.6895px"
					viewBox="0 0 291.379 291.379"
					enable-background="new 0 0 1000 291.379"
					class="h-[1.5em] w-fit"
				>
					<path
						d="M177.083,93.525c18.819,13.441,41.864,21.35,66.755,21.35V77.189c-13.894-2.958-26.194-10.215-35.442-20.309   c-15.83-9.873-27.235-26.161-30.579-45.225h-34.896v191.226c-0.079,22.293-18.18,40.344-40.502,40.344   c-13.154,0-24.84-6.267-32.241-15.975c-13.216-6.667-22.279-20.354-22.279-36.16c0-22.355,18.131-40.48,40.501-40.48   c4.286,0,8.417,0.667,12.292,1.896v-38.098c-48.039,0.992-86.674,40.224-86.674,88.474c0,24.086,9.621,45.921,25.236,61.875   c14.087,9.454,31.045,14.968,49.29,14.968c48.899,0,88.54-39.621,88.54-88.496V93.525L177.083,93.525z"
						fill="currentColor"
					/>
				</svg>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-1 font-semibold">{artist.id}</h3>
		</div>
	</div>
</a>
