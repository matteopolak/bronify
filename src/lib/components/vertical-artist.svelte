<script lang="ts">
	import { artistThumbnail } from '$lib/get';
	import type { Artist } from '$lib/types';

	let { artist }: { artist: Artist } = $props();

	let cover = $derived(artistThumbnail(artist.id));
</script>

<a
	class="group card hover:bg-base-300/50 flex h-auto w-44 flex-shrink-0 cursor-pointer flex-col gap-2 p-3 text-left transition-all duration-100"
	href="/artists/{artist.id}"
>
	<img
		src={cover}
		loading="lazy"
		alt="Album cover"
		class="relative h-auto w-auto shrink-0 rounded-full bg-black object-cover shadow-lg"
	/>

	<div class="flex flex-col">
		<h2 class="text-base">{artist.display_name ?? artist.id}</h2>
		<p class="text-sm text-neutral-300">Artist</p>
	</div>
</a>
