import type { Album, Artist } from './types';

import trackData from '$lib/content/tracks.json';
import artistData from '$lib/content/artists.json';
import albumData from '$lib/content/albums.json';

const TRACK_THUMBS: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/tracks/*/thumbnail.webp',
	{
		eager: true,
		query: '?url'
	}
);

const ARTIST_THUMBS: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/artists/*.webp',
	{
		eager: true,
		query: '?url'
	}
);

const ALBUM_THUMBS: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/albums/*/*.webp',
	{
		eager: true,
		query: '?url'
	}
);

const TRACK_LYRICS: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/tracks/*/lyrics.srt',
	{
		eager: true,
		query: '?url'
	}
);

const TRACK_AUDIO: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/tracks/*/audio.mp3',
	{
		eager: true,
		query: '?url'
	}
);

const artistMap: Map<string, Artist> = new Map();

for (const artist of artistData) {
	artistMap.set(artist.id, artist);
}

const albumMap: Map<string, Album> = new Map();

for (const album of albumData) {
	albumMap.set(album.id, album);
}

export function getArtist(id: string): Artist {
	return artistMap.get(id)!;
}

export function getAlbum(id: string): Album {
	return albumMap.get(id)!;
}

export function artistThumbnail(id: string): string {
	return ARTIST_THUMBS[`/src/lib/content/artists/${id}.webp`].default;
}

export function trackThumbnail(id: string): string {
	return TRACK_THUMBS[`/src/lib/content/tracks/${id}/thumbnail.webp`].default;
}

export function albumThumbnail(id: string): string {
	return ALBUM_THUMBS[`/src/lib/content/albums/${id}/thumbnail-64.webp`].default;
}

export function albumCover(id: string): string {
	return ALBUM_THUMBS[`/src/lib/content/albums/${id}/thumbnail.webp`].default;
}

export function trackLyrics(id: string): string | undefined {
	return TRACK_LYRICS[`/src/lib/content/tracks/${id}/lyrics.srt`]?.default;
}

export function trackAudio(id: string): string {
	return TRACK_AUDIO[`/src/lib/content/tracks/${id}/audio.mp3`].default;
}

export { trackData, artistData };
