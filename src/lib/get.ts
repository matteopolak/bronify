import type { Album, Artist, Lyrics, Track } from './types';

import trackData from '$lib/content/tracks.json';
import artistData from '$lib/content/artists.json';
import albumData from '$lib/content/albums.json';
import categoryData from '$lib/content/tags.json';

// word -> TrackIndex[]
import lyricsIndex from '$lib/content/lyrics_index.json';

export function searchLyrics(text: string) {
	// lowercase, split by spaces, remove non-[a-z] characters
	const words = text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/gi, '')
		.split(/\s+/);

	// return results, sorted by the number of words matched
	const trackIndexToCount: Map<number, number> = new Map();

	// set to 0 for each track
	for (const track of trackData) {
		trackIndexToCount.set(track.index, 0);
	}

	for (const word of words) {
		const trackIndices = lyricsIndex[word as keyof typeof lyricsIndex];
		if (!trackIndices) continue;

		for (const trackIndex of trackIndices) {
			const count = trackIndexToCount.get(trackIndex) ?? 0;
			trackIndexToCount.set(trackIndex, count + 1);
		}
	}

	// sort by count
	return trackData
		.filter((t) => trackIndexToCount.get(t.index))
		.sort((a, b) => {
			const aCount = trackIndexToCount.get(a.index) ?? 0;
			const bCount = trackIndexToCount.get(b.index) ?? 0;

			if (aCount === bCount) {
				return a.index - b.index;
			}

			return bCount - aCount;
		});
}

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

const CATEGORY_THUMBS: Record<string, { default: string }> = import.meta.glob(
	'/src/lib/content/tags/*.webp',
	{
		eager: true,
		query: '?url'
	}
);

const TRACK_LYRICS: Record<string, () => Promise<{ default: Lyrics }>> = import.meta.glob(
	'/src/lib/content/tracks/*/lyrics.json'
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

const trackMap: Map<string, Track> = new Map();

for (const track of trackData) {
	trackMap.set(track.id, track);
}

const trackIndexMap: Map<number, Track> = new Map();

for (const track of trackData) {
	trackIndexMap.set(track.index, track);
}

export function getArtistDisplayName(artist: Pick<Artist, 'display_name' | 'username'>) {
	return artist.display_name ?? artist.username;
}

export function getArtist(id: string): Artist {
	return artistMap.get(id)!;
}

export function getAlbum(id: string): Album {
	console.log('Album ID:', id);
	return albumMap.get(id)!;
}

export function getTrack(id: string): Track {
	return trackMap.get(id)!;
}

export function getTrackByIndex(index: number): Track | undefined {
	return trackIndexMap.get(index);
}

export function artistThumbnail(id: string): string {
	const value = ARTIST_THUMBS[`/src/lib/content/artists/${id}.webp`];
	if (!value) console.error(`Artist thumbnail not found for ${id}`);
	return value?.default ?? 'https://placehold.co/256x256';
}

export function trackThumbnail(id: string): string {
	const value = TRACK_THUMBS[`/src/lib/content/tracks/${id}/thumbnail.webp`];
	if (!value) console.error(`Track thumbnail not found for ${id}`);
	return value?.default ?? 'https://placehold.co/256x256';
}

export function albumThumbnail(id: string): string {
	const value = ALBUM_THUMBS[`/src/lib/content/albums/${id}/thumbnail-64.webp`];
	if (!value) console.error(`Album thumbnail not found for ${id}`);
	return value?.default ?? 'https://placehold.co/256x256';
}

export function albumCover(id: string): string {
	const value = ALBUM_THUMBS[`/src/lib/content/albums/${id}/thumbnail.webp`];
	if (!value) console.error(`Album cover not found for ${id}`);
	return value?.default ?? 'https://placehold.co/256x256';
}

export function categoryThumbnail(id: string): string {
	const value = CATEGORY_THUMBS[`/src/lib/content/tags/${id}-thumb.webp`];
	if (!value) console.error(`Category thumbnail not found for ${id}`);
	return value?.default ?? 'https://placehold.co/256x256';
}

export function categoryCover(id: string): string {
	const value = CATEGORY_THUMBS[`/src/lib/content/tags/${id}-cover.webp`];
	if (!value) console.error(`Category cover not found for ${id}`);
	return value?.default ?? 'https://placehold.co/256x256';
}

export function trackLyrics(id: string): Promise<Lyrics> | undefined {
	return TRACK_LYRICS[`/src/lib/content/tracks/${id}/lyrics.json`]?.().then((l) => l.default);
}

export function trackAudio(id: string): string {
	const value = TRACK_AUDIO[`/src/lib/content/tracks/${id}/audio.mp3`];
	if (!value) console.error(`Track audio not found for ${id}`);
	return value?.default ?? '';
}

export { trackData, artistData, albumData, categoryData };
