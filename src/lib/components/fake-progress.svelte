<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';

	onMount(() => {
		NProgress.configure({ showSpinner: false });
	});

	beforeNavigate(() => {
		NProgress.start();
	});

	afterNavigate(() => {
		NProgress.done();
	});
</script>

<style>
	:global(#nprogress .bar) {
		background: var(--color-primary);
	}
</style>
