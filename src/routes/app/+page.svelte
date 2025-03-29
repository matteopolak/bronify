<script lang="ts">
	import { ArrowBigDownDash } from '@lucide/svelte';
	import { onMount } from 'svelte';

	function getMobileOperatingSystem(): 'Android' | 'iOS' | 'Desktop' {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;

		// Windows Phone must come first because its UA also contains "Android"
		if (/windows phone/i.test(userAgent)) {
			//return 'Windows Phone';
			return 'Desktop';
		}

		if (/android/i.test(userAgent)) {
			return 'Android';
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			return 'iOS';
		}

		return 'Desktop';
	}

	let os = $state('unknown');
	let link = $derived(
		/*os === 'Android' ? '/bronify.apk' : os === 'iOS' ? '/bronify.ipa' : */ null
	);

	onMount(() => {
		os = getMobileOperatingSystem();
	});
</script>

<div class="flex flex-col place-items-start gap-4 p-3 md:p-6">
	<h1 class="text-5xl">
		Download Bronify for <span class="font-bold">{os}</span>
	</h1>

	<p class="text-neutral-300">
		The Bronify app does not need any permissions and works offline. All data is kept on your
		device.
	</p>

	{#if link}
		<a class="btn btn-primary btn-lg" href="/bronify.apk" aria-label="Install app">
			<ArrowBigDownDash size="1.2em" fill="currentColor" />
			Download the app
		</a>
	{:else}
		<p class="mt-auto text-neutral-400">No app available for your platform yet.</p>
	{/if}
</div>
