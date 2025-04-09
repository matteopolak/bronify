<script lang="ts">
	import { onDestroy } from 'svelte';

	const ws = new WebSocket('ws://localhost:3000/ws');

	ws.onopen = () => {
		console.log('WebSocket connection opened');
	};

	ws.onmessage = (event) => {
		console.log('Message from server:', event.data);
	};

	onDestroy(() => {
		ws.close();
	});
</script>
