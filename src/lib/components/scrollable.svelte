<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';

	let { children } = $props();

	let container: HTMLDivElement = $state()!;

	function scrollLeft() {
		container.scrollBy({ left: -400, behavior: 'smooth' });
	}

	function scrollRight() {
		container.scrollBy({ left: 400, behavior: 'smooth' });
	}
</script>

<div class="relative">
	<button class="arrow left-1" onclick={scrollLeft}>
		<ArrowLeft />
	</button>
	<div
		class="flex flex-row flex-nowrap gap-2 overflow-x-auto"
		bind:this={container}
		onwheel={(e) => {
			e.preventDefault();
			container.scrollBy({ left: e.deltaY * 3, behavior: 'smooth' });
		}}
	>
		{@render children()}
	</div>
	<button class="arrow right-1" onclick={scrollRight}>
		<ArrowRight />
	</button>
</div>

<style>
	@reference "../../app.css";

	.arrow {
		@apply bg-base-300/80 hover:bg-base-300 absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-2 shadow transition-all duration-100 ease-in-out;
	}
</style>
