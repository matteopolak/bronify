import { getTrackByIndex } from './get';
import type { Playlist, Track } from './types';

function mulberry32(seed: number) {
	return function () {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function stringToSeed(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
	}
	return hash;
}

function pastelRgba(hue: number, alpha: number): string {
	const saturation = 75; // sweet spot for pastel saturation
	const lightness = 50; // slightly brighter for pop
	hue = hue % 360;

	// convert HSL to RGBA
	hue /= 360;
	const s = saturation / 100;
	const l = lightness / 100;
	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, hue + 1 / 3);
		g = hue2rgb(p, q, hue);
		b = hue2rgb(p, q, hue - 1 / 3);
	}

	const to255 = (x: number) => Math.round(x * 255);
	return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${alpha})`;
}

function generateThumbnail(id: string, width: number, height: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	const seed = stringToSeed(id);
	const rand = mulberry32(seed);

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);

	const baseHue = rand() * 360;
	const count = 5 + Math.floor(rand() * 5);
	const minSize = Math.min(width, height) * 0.15;
	const maxSize = Math.min(width, height) * 0.35;

	for (let i = 0; i < count; i++) {
		const radius = minSize + rand() * (maxSize - minSize);
		const x = rand() * width;
		const y = rand() * height;
		const alpha = 0.6 + rand() * 0.3; // 0.4 – 0.7
		const hue = baseHue + rand() * 15 - 15;

		const color = pastelRgba(hue, alpha);

		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fillStyle = color;
		ctx.fill();
	}

	return canvas;
}

export async function generateArtBlob(seed: string, width: number, height: number) {
	const canvas = generateThumbnail(seed, width, height);

	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		});
	});

	if (!blob) {
		console.error('Failed to create blob from canvas');
		return '';
	}

	return URL.createObjectURL(blob);
}

function base64UrlEncode(str: string): string {
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // remove trailing =
}

function base64UrlDecode(str: string): string {
	// Add padding back if needed
	let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4 !== 0) {
		base64 += '=';
	}
	return atob(base64);
}

export function encodePlaylist(playlist: Omit<Playlist, 'id'>): string {
	const encoder = new TextEncoder();
	let titleBytes = encoder.encode(playlist.title);
	if (titleBytes.length > 20) {
		titleBytes = titleBytes.slice(0, 20); // truncate to 20 bytes
	}

	const totalLength = 1 + titleBytes.length + playlist.tracks.length * 2;
	const buffer = new Uint8Array(totalLength);

	buffer[0] = titleBytes.length;
	buffer.set(titleBytes, 1);

	for (const [idx, track] of playlist.tracks.entries()) {
		const index = track.index;
		const offset = 1 + titleBytes.length + idx * 2;
		buffer[offset] = (index >> 8) & 0xff;
		buffer[offset + 1] = index & 0xff;
	}

	const binaryStr = String.fromCharCode(...buffer);
	return base64UrlEncode(binaryStr);
}

function decodePlaylistInner(encoded: string): Playlist {
	// Base64 decode (may throw)
	const binaryStr = base64UrlDecode(encoded);
	if (binaryStr.length === 0) {
		throw new Error('Decoded data is empty');
	}

	const buffer = new Uint8Array(binaryStr.length);
	for (let i = 0; i < binaryStr.length; i++) {
		buffer[i] = binaryStr.charCodeAt(i);
	}

	const titleLength = buffer[0];

	if (titleLength > 20) {
		throw new Error(`Title length ${titleLength} exceeds 20-character limit`);
	}

	if (buffer.length < 1 + titleLength) {
		throw new Error('Insufficient data for title content');
	}

	const titleBytes = buffer.slice(1, 1 + titleLength);
	const decoder = new TextDecoder();
	const title = decoder.decode(titleBytes);

	const songBytes = buffer.slice(1 + titleLength);

	if (songBytes.length % 2 !== 0) {
		throw new Error('Corrupt song data: unexpected byte length');
	}

	const songs: Track[] = [];
	for (let i = 0; i < songBytes.length; i += 2) {
		const index = (songBytes[i] << 8) | songBytes[i + 1];
		const track = getTrackByIndex(index);

		if (!track) {
			throw new Error(`Track not found for index ${index}`);
		}

		songs.push(track);
	}

	return {
		id: encoded,
		title,
		tracks: songs
	};
}

export function decodePlaylist(encoded: string): Playlist | null {
	try {
		return decodePlaylistInner(encoded);
	} catch (e) {
		console.error('Failed to decode playlist:', e);
		return null;
	}
}

export function getStoredPlaylistIds(): string[] {
	const storedPlaylists = localStorage.getItem('playlists');
	if (!storedPlaylists) {
		return [];
	}

	try {
		const parsed = JSON.parse(storedPlaylists);
		if (Array.isArray(parsed)) {
			return parsed;
		}
	} catch (e) {
		console.error('Failed to parse stored playlists:', e);
	}

	return [];
}

function deletePlaylistInner(encoded: string) {
	const idx = playlists.findIndex((p) => p.id === encoded);
	if (idx !== -1) {
		playlists.splice(idx, 1);
	}
}

export function deletePlaylist(playlist: Playlist) {
	// If it has an `id` set, it was previously stored so we need to remove it!
	if (playlist.id) {
		deletePlaylistInner(playlist.id);
	}

	localStorage.setItem('playlists', JSON.stringify(playlists.map((p) => p.id)));
}

export function deletePlaylistById(id: string) {
	// If it has an `id` set, it was previously stored so we need to remove it!
	deletePlaylistInner(id);

	localStorage.setItem('playlists', JSON.stringify(playlists.map((p) => p.id)));
}

// Stores (and removes old) playlist
export function createPlaylist(playlist: { title: string; tracks: Track[] }): Playlist {
	// If it has an `id` set, it was previously stored so we need to remove it!
	const playlistId = encodePlaylist(playlist);

	deletePlaylistInner(playlistId);

	const created: Playlist = {
		...playlist,
		id: playlistId
	} satisfies Playlist;

	playlists.push(created);
	sync();

	return created;
}

export function addToPlaylist(playlist: Playlist, track: Track) {
	if (playlist.tracks.find((t) => t.index === track.index)) {
		return;
	}

	playlist.tracks.push(track);
	playlist.id = encodePlaylist(playlist);
	sync();

	return playlist;
}

export function removeFromPlaylist(playlist: Playlist, track: Track): Playlist {
	const idx = playlist.tracks.findIndex((t) => t.index === track.index);
	if (idx === -1) {
		return playlist;
	}

	playlist.tracks.splice(idx, 1);
	playlist.id = encodePlaylist(playlist);
	sync();

	return playlist;
}

export function setTitle(playlist: Playlist, title: string): Playlist {
	playlist.title = title;
	playlist.id = encodePlaylist(playlist);
	sync();

	return playlist;
}

export function sync() {
	localStorage.setItem('playlists', JSON.stringify(playlists.map((p) => p.id)));
}

export const playlists: Playlist[] = $state([]);
