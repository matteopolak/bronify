import type { Artist } from './types';

import songData from '$lib/content/songs.json';
import artistData from '$lib/content/artists.json';

const thumbnails: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/songs/*.webp',
	{
		eager: true,
		query: '?url'
	}
);

const artistThumbnails: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/artists/*.webp',
	{
		eager: true,
		query: '?url'
	}
);

const artistMap: Map<string, Artist> = new Map();

for (const artist of artistData) {
	artistMap.set(artist.id, artist);
}

export function getArtist(id: string): Artist {
	return artistMap.get(id)!;
}

export function artistThumbnail(id: string): string {
	return artistThumbnails[`/src/lib/content/artists/${id}.webp`].default;
}

export function songThumbnail(id: string): string {
	return thumbnails[`/src/lib/content/songs/${id}.webp`].default;
}

export { songData, artistData };
