<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deletePlaylistById } from '$lib/playlist.svelte';
	import type { Collection } from '$lib/types';
	import { Trash } from '@lucide/svelte';

	type CollectionCover = Omit<Collection, 'cover' | 'tracks'> & { cover: Promise<string> | string };

	let { content }: { content: CollectionCover } = $props();

	function collectionPrefix(content: Pick<Collection, 'type'>): string {
		if (content.type === 'playlist') {
			return 'Playlist • ';
		}

		if (content.type === 'album') {
			return 'Album • ';
		}

		return '';
	}

	let cover = $state<string | undefined>(
		typeof content.cover === 'string' ? content.cover : undefined
	);

	$effect(() => {
		if (typeof content.cover === 'string') {
			cover = content.cover;
		} else {
			content.cover.then((c) => {
				cover = c;
			});
		}
	});

	let active = $derived(
		page.url.pathname === `/${content.type}s/${encodeURIComponent(content.id)}`
	);
</script>

<a
	class="flex flex-row gap-2 rounded-md p-2"
	class:active
	class:inactive={!active}
	href="/{content.type}s/{content.id}"
>
	<img
		src={cover}
		loading="lazy"
		alt="Album cover"
		class="h-12 w-12 bg-black"
		class:rounded-full={content.type === 'artist'}
		class:rounded-md={content.type !== 'artist'}
	/>

	<div class="flex flex-col">
		<h2 class="text-base">{content.title}</h2>
		<p class="text-sm text-neutral-300">{collectionPrefix(content)}{content.subtitle}</p>
	</div>

	{#if content.type === 'playlist'}
		<button
			class="btn btn-ghost btn-square m-1 ml-auto self-center text-slate-400 transition-all duration-300 ease-in-out hover:text-white"
			onclick={(e) => {
				if (active) goto('/');
				e.preventDefault();
				deletePlaylistById(content.id);
			}}
		>
			<Trash size="1.2em" fill="currentColor" />
		</button>
	{/if}
</a>

<style>
	@reference '../../app.css';

	.active {
		@apply bg-base-300/90;
	}

	.active:hover {
		@apply bg-base-300;
	}

	.inactive:hover {
		@apply bg-base-300/50;
	}
</style>
