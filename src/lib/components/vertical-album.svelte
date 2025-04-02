<script lang="ts">
	import { albumThumbnail, getArtist, getArtistDisplayName } from '$lib/get';
	import type { Album } from '$lib/types';

	let { album }: { album: Album } = $props();

	let cover = $derived(albumThumbnail(album.id));
	let artist = $derived(getArtist(album.artist));
</script>

<a
	class="group card hover:bg-base-300/50 flex h-auto w-44 flex-shrink-0 cursor-pointer flex-col gap-2 p-3 text-left transition-all duration-100"
	href="/albums/{album.id}"
>
	<img
		src={cover}
		loading="lazy"
		alt="Album cover"
		class="relative h-auto w-auto shrink-0 rounded-md bg-black object-cover shadow-lg"
	/>

	<div class="flex flex-col">
		<h2 class="text-base">{album.title}</h2>
		<p class="text-sm text-neutral-300">
			{getArtistDisplayName(artist ?? { username: album.artist })}
		</p>
	</div>
</a>
