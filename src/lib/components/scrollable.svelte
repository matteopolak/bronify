<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let { children, class: klass }: { children: Snippet; class?: string } = $props();

	let container: HTMLDivElement = $state()!;

	function left() {
		container.scrollBy({ left: -400, behavior: 'smooth' });
	}

	function right() {
		container.scrollBy({ left: 400, behavior: 'smooth' });
	}

	let clientWidth = $state(0);
	let scrollLeft = $state(0);
	let scrollWidth = $state(0);

	let canLeft = $derived(scrollLeft > 20);
	let canRight = $derived(scrollWidth - clientWidth > scrollLeft + 20);

	$effect(() => {
		clientWidth = container.clientWidth;
		scrollLeft = container.scrollLeft;
		scrollWidth = container.scrollWidth;
	});
</script>

<div class="relative">
	<button class="arrow left-1" class:opacity-0={!canLeft} onclick={left}>
		<ArrowLeft />
	</button>
	<div
		class="flex flex-row flex-nowrap overflow-x-auto {klass}"
		bind:this={container}
		bind:clientWidth
		onscroll={() => {
			scrollLeft = container.scrollLeft;
			scrollWidth = container.scrollWidth;
		}}
	>
		{@render children()}
	</div>
	<button class="arrow right-1" class:opacity-0={!canRight} onclick={right}>
		<ArrowRight />
	</button>
</div>

<style>
	@reference "../../app.css";

	.arrow {
		@apply bg-base-300/80 hover:bg-base-300 absolute top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full p-2 shadow transition-all duration-100 ease-in-out md:block;
	}
</style>
