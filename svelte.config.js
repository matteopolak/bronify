import adapter from '@sveltejs/adapter-static';
import cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const useCloudflare = process.env.CF_PAGES === '1';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		version: {
			pollInterval: 30_000
		},
		adapter: useCloudflare
			? cloudflare()
			: adapter({
					pages: 'build',
					assets: 'build',
					fallback: 'index.html'
				})
	}
};

export default config;
