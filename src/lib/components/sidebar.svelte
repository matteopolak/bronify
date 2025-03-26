<script lang="ts">
	import { DYNAMIC_HEIGHT_CLASS } from '$lib/constants';
	import type { Collection } from '$lib/types';
	import { Library } from '@lucide/svelte';

	let { children } = $props();

	let selected: string | undefined = $state();

	function collectionPrefix(content: Collection): string {
		if (content.type === 'playlist') {
			return 'Playlist • ';
		}

		if (content.type === 'album') {
			return 'Album • ';
		}

		return '';
	}
</script>

{#snippet collection(content: Collection)}
	{@const active = content.id === selected}

	<div class="flex flex-row gap-2 rounded-md p-2" class:active class:inactive={!active}>
		<img
			src={content.cover ?? 'https://placehold.co/48'}
			alt="Album cover"
			class="h-12 w-12 rounded-md"
		/>

		<div class="flex flex-col">
			<h2 class="text-base">{content.title}</h2>
			<p class="text-sm text-neutral-300">{collectionPrefix(content)}{content.subtitle}</p>
		</div>
	</div>
{/snippet}

<div class="drawer drawer-open px-2">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content pb-32 pl-2 {DYNAMIC_HEIGHT_CLASS}">
		{@render children()}
	</div>
	<div class="drawer-side {DYNAMIC_HEIGHT_CLASS} rounded-lg">
		<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="bg-base-200 text-base-content flex min-h-full w-xs flex-col gap-1 p-2">
			<h1 class="p-4 font-semibold text-neutral-400">
				<Library class="inline" />
				Your Library
			</h1>

			{@render collection({
				id: 'liked',
				title: 'Liked Songs',
				subtitle: 'Bronify',
				type: 'playlist'
			})}

			{@render collection({
				id: 'discover-weekly',
				title: 'Discover Weekly',
				subtitle: 'Bronify',
				type: 'playlist'
			})}
		</div>
	</div>
</div>

<style>
	@reference '../../app.css';

	.active {
		@apply bg-base-300/90;
	}

	.active:hover {
		@apply bg-base-300;
	}

	.inactive:hover {
		@apply hover:bg-base-300/50;
	}
</style>
