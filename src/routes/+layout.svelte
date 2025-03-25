<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}

<footer
	class="footer footer-horizontal footer-center bg-base-100 text-base-content rounded p-10 pb-30"
>
	<nav class="grid grid-flow-col gap-4">
		<a class="link link-hover" href="mailto:contact@bronify.love">
			Contact (for takedown requests or additions)
		</a>
	</nav>
	<aside>
		<p>
			Copyright © {new Date().getFullYear()} - No rights reserved by Bronify. Feel free to take anything.
		</p>
	</aside>
</footer>
