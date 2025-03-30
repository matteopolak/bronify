<script lang="ts">
	import app from '$lib/images/app.png?enhanced';

	import { ArrowBigDownDash } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { UAParser } from 'ua-parser-js';

	type Platform =
		| 'unknown'
		| 'android'
		| 'ios'
		| 'windows'
		| 'linux'
		| 'macos'
		| 'macos_arm'
		| 'macos_intel';

	const FILES_BY_PLATFORM: Record<Platform, string[]> = {
		unknown: [],
		android: ['bronify.apk'],
		ios: ['Bronify.app.zip'],
		windows: ['Bronify_x64_en-US.msi', 'Bronify_x64-setup.exe'],
		linux: ['bronify.x86_64.rpm', 'bronify_amd64.AppImage', 'bronify_amd64.deb'],
		macos: [],
		macos_arm: ['Bronify_aarch64.dmg', 'Bronify_aarch64.app.tar.gz'],
		macos_intel: ['Bronify_x64.dmg', 'Bronify_x64.app.tar.gz']
	};

	FILES_BY_PLATFORM.macos = [...FILES_BY_PLATFORM.macos_arm, ...FILES_BY_PLATFORM.macos_intel];

	const PRETTY_NAME: Record<Platform, string> = {
		unknown: 'Unknown',
		android: 'Android',
		ios: 'iOS',
		windows: 'Windows',
		linux: 'Linux',
		macos: 'macOS',
		macos_arm: 'macOS (ARM)',
		macos_intel: 'macOS (Intel)'
	};

	let platform: Platform = $state('unknown');

	export function detectPlatform(userAgentString?: string): Platform {
		const parser = new UAParser(userAgentString);
		const os = parser.getOS();
		const cpu = parser.getCPU();

		const osName = os.name?.toLowerCase();
		const cpuArch = cpu.architecture?.toLowerCase();

		if (!osName) return 'unknown';

		if (osName.includes('android')) return 'android';
		if (
			osName.includes('ios') ||
			(osName.includes('mac os') && /iphone|ipad/.test(userAgentString ?? ''))
		)
			return 'ios';
		if (osName.includes('windows')) return 'windows';
		if (osName.includes('linux')) return 'linux';

		if (osName.includes('mac')) {
			// Try to detect ARM vs Intel
			if (cpuArch === 'arm64') return 'macos_arm';
			if (cpuArch === 'amd64' || cpuArch === 'x86' || cpuArch === 'ia32') return 'macos_intel';

			// Heuristic fallback based on common UA hints
			if (userAgentString) {
				const ua = userAgentString.toLowerCase();
				if (ua.includes('apple m1') || ua.includes('apple m2') || ua.includes('arm')) {
					return 'macos_arm';
				}
			}

			// If unable to determine
			return 'macos';
		}

		return 'unknown';
	}

	onMount(() => {
		// @ts-expect-error - bunch of stuff isn't official
		const userAgent: string = navigator.userAgent || navigator.vendor || window.opera;

		platform = detectPlatform(userAgent);
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
	{#if platform === 'android' || platform === 'ios'}
		<div>
			<h2 class="text-4xl">
				Add <span class="font-bold">Bronify</span> to your home screen
			</h2>

			<p class="text-neutral-400">
				Add Bronify to your home screen by clicking the share button in your browser and selecting
				"Add to Home Screen".
			</p>

			<a href="https://www.brandeis.edu/its/support/website-shortcut.html">
				For more information, click here.
			</a>
		</div>
	{/if}

	<h1 class="text-4xl">
		Download Bronify for <span class="font-bold">
			{PRETTY_NAME[platform] ?? PRETTY_NAME.unknown}
		</span>
	</h1>

	<p class="text-neutral-300">
		The Bronify app does not need any permissions and works offline. All data is kept on your
		device.
	</p>

	{#if platform === 'ios'}
		<p class="text-neutral-300">
			This build is not signed, please wait for a signed version to be available if you want to use
			the native application.
		</p>
	{/if}

	{#each FILES_BY_PLATFORM[platform] as file (file)}
		<button
			class="btn btn-primary btn-lg"
			aria-label="Install app"
			onclick={() => download(`https://r2.bronify.love/${file}`)}
		>
			<ArrowBigDownDash size="1.2em" fill="currentColor" />
			Download {file}
		</button>
	{/each}

	{#if FILES_BY_PLATFORM[platform].length === 0}
		<p class="mt-auto text-neutral-400">No app available for your platform yet.</p>
	{/if}
</div>
