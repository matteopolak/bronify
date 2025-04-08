<script lang="ts" generics="T">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import { type Snippet } from 'svelte';
	import { VirtualScroll } from './virtual-scroll';

	let {
		items,
		item,
		vertical = false,
		key,
		class: klass = ''
	}: {
		items: T[];
		item: Snippet<[T]>;
		vertical?: boolean;
		key: keyof T & string;
		class?: string;
	} = $props();

	let scroller: VirtualScroll = $state()!;

	function left() {
		scroller.scrollToOffset(scroller.getOffset() - 400);
	}

	function right() {
		scroller.scrollToOffset(scroller.getOffset() + 400);
	}

	let clientWidth = $state(0);
	let scrollLeft = $state(0);
	let scrollWidth = $state(0);

	let canLeft = $derived(scrollLeft > 0);
	let canRight = $derived(scrollWidth - clientWidth > scrollLeft + 10);

	$effect(() => {
		items;

		scrollWidth = scroller.getScrollSize();
	});
</script>

<div class="relative">
	{#if !vertical && canLeft}
		<button class="arrow left-1" onclick={left}>
			<ArrowLeft />
		</button>
	{/if}
	<div class:v={vertical} class:h={!vertical}>
		<VirtualScroll
			data={items}
			let:data
			isHorizontal={!vertical}
			{key}
			bind:this={scroller}
			class={klass}
			on:scroll={(e) => {
				scrollLeft = e.detail.event.originalTarget.scrollLeft + 500;
			}}
		>
			{@render item(data)}
		</VirtualScroll>
	</div>
	{#if !vertical && canRight}
		<button class="arrow right-1" onclick={right}>
			<ArrowRight />
		</button>
	{/if}
</div>

<style>
	@reference "../../app.css";

	.arrow {
		@apply bg-base-300/80 hover:bg-base-300 absolute top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full p-2 shadow transition-all duration-100 ease-in-out md:block;
	}

	.h :global(.virtual-scroll-wrapper) {
		@apply flex flex-row gap-2 scroll-smooth;
	}

	.h :global(.virtual-scroll-root) {
		@apply flex flex-row;
	}

	.v :global(.virtual-scroll-wrapper) {
		@apply flex flex-col gap-2 scroll-smooth;
	}

	.v :global(.virtual-scroll-root) {
		@apply flex flex-col;
	}
</style>
