<script lang="ts">
	import { player, settings } from '$lib/player.svelte';
	import { AudioLines } from '@lucide/svelte';

	let { size = '1.3em', class: klass = '' }: { size?: string; class?: string } = $props();

	let lyrics = settings.lyrics;
</script>

<button
	onclick={() => {
		player.karaoke = !player.karaoke;

		if (player.karaoke) {
			lyrics = settings.lyrics;
			settings.lyrics = 'on';
		} else if (settings.lyrics === 'on') {
			settings.lyrics = lyrics;
		}
	}}
	class="cursor-pointer text-left transition-all duration-100 ease-in-out {klass}"
	class:inactive={!player.karaoke}
	class:text-white={player.karaoke}
>
	<AudioLines {size} />
</button>

<style>
	@reference "../../../app.css";

	.inactive {
		@apply text-neutral-100/50 hover:text-white;
	}
</style>
