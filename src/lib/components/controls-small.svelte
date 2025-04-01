<script lang="ts">
	import { getArtist, trackThumbnail } from '$lib/get';
	import { player } from '$lib/player.svelte';
	import { Pause, Play } from '@lucide/svelte';

	let url = $derived(trackThumbnail(player.track.id));
</script>

<a href="/immersive" class="flex h-14 w-full cursor-pointer flex-row place-items-center gap-2">
	<img src={url} alt={player.track.title} sizes="16px" class="h-full rounded-md" />

	<div class="flex flex-col text-left">
		<h3 class="text-sm font-semibold">{player.track.title}</h3>
		<span class="text-sm text-slate-300">
			{getArtist(player.track.artist).display_name ?? player.track.artist}
		</span>
	</div>

	<div
		role="button"
		onclick={(e) => {
			e.stopPropagation();
			e.preventDefault();
			player.toggle(player.track);
		}}
		class="mr-3 ml-auto cursor-pointer rounded-full text-left"
		tabindex={0}
		onkeydown={() => {}}
	>
		{#if player.paused}
			<Play fill="currentColor" size="2em" />
		{:else}
			<Pause fill="currentColor" size="2em" />
		{/if}
	</div>

	<div class="absolute -bottom-[0.35em] left-0 w-full px-2" aria-label="Seek">
		<progress
			class="progress h-[0.125rem] w-full rounded-md lg:hidden"
			value={player.duration === 0 ? 0 : player.currentSeconds / player.duration}
			max={1}
		></progress>
	</div>
</a>
