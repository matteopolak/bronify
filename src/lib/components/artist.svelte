<script lang="ts">
	import { artistThumbnail } from '$lib/get';
	import type { Artist } from '$lib/types';

	let { artist }: { artist: Artist } = $props();
	let url = $derived(artistThumbnail(artist.id));
</script>

<a
	class="group card hover:bg-base-200 flex h-28 w-auto cursor-pointer flex-col gap-2 p-2 text-left transition-all duration-100 sm:h-auto"
	href="/artists/{artist.id}"
>
	<img loading="lazy" src={url} alt={artist.id} class="h-24 w-24 rounded-lg sm:h-auto sm:w-auto" />

	<div class="flex flex-col gap-1">
		<div class="flex flex-col">
			<h3 class="text-md line-clamp-1 font-semibold">{artist.id}</h3>
		</div>
	</div>
</a>
