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
		os === 'Android' ? '/app/bronify.apk' : os === 'iOS' ? '/app/Bronify.app.zip' : null
	);

	onMount(() => {
		os = 'Android'; //getMobileOperatingSystem();
	});

	function download(url: string) {
		const a = document.createElement('a');
		a.href = url;
		a.download = '';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<div class="flex flex-col place-items-start gap-4 p-3 md:p-6">
	<!-- User can also add to Home screen -->
	<div>
		<h2 class="text-4xl">
			Add <span class="font-bold">Bronify</span> to your home screen
		</h2>

		<p class="text-neutral-400">
			Add Bronify to your home screen by clicking the share button in your browser and selecting
			"Add to Home Screen".
		</p>

		<a href="https://www.brandeis.edu/its/support/website-shortcut.html"
			>For more information, click here.</a
		>
	</div>

	<h1 class="text-4xl">
		Download Bronify for <span class="font-bold">{os}</span>
	</h1>

	<p class="text-neutral-300">
		The Bronify app does not need any permissions and works offline. All data is kept on your
		device.
	</p>

	{#if link}
		{#if os === 'iOS'}
			<p class="text-neutral-300">
				This build is not signed, please wait for a signed version to be available if you want to
				use the native application.
			</p>
		{:else if os === 'Android'}
			<p class="text-neutral-300">
				For more instructions, <a
					href="https://www.androidauthority.com/how-to-install-apks-31494/"
					class="text-white underline"
				>
					see this guide
				</a>.
			</p>
		{/if}

		<button class="btn btn-primary btn-lg" aria-label="Install app" onclick={() => download(link)}>
			<ArrowBigDownDash size="1.2em" fill="currentColor" />
			Download {os === 'iOS' ? 'Bronify.app.zip' : 'bronify.apk'}
		</button>
	{:else}
		<p class="mt-auto text-neutral-400">No app available for your platform yet.</p>
	{/if}
</div>
