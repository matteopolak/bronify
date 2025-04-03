<script lang="ts">
	let { children }: { children: Snippet } = $props();
</script>

<div class="prose mx-auto p-8">
	{@render children()}
</div>
