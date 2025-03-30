import { trackData } from './get';

import { trackAudio, trackLyrics } from './get';
import type { Lyrics, Track, TrackSettings } from './types';
import { browser } from '$app/environment';
import { randomElement } from './util';

const LYRICS_PLACEHOLDER: Lyrics = [
	{
		start: 0,
		end: 0,
		words: [
			{
				text: 'No lyrics available',
				start: 0,
				end: 0,
				index: 0
			}
		]
	}
];

export function floatFromStorage(key: string, defaultValue: number) {
	if (!browser) return defaultValue;

	const value = localStorage.getItem(key);
	if (value === null) return defaultValue;

	const parsed = parseFloat(value);
	if (isNaN(parsed)) return defaultValue;

	return parsed;
}

export function stringFromStorage<T extends string = string>(key: string, defaultValue: T): T {
	if (!browser) return defaultValue;

	const value = localStorage.getItem(key);
	if (value === null) return defaultValue;

	return value as T;
}

export class Player {
	public audio!: HTMLAudioElement;

	duration = $state(0);
	currentSeconds = $state(0);
	volume = $state(1);
	paused = $state(true);

	lyrics: Lyrics | null = $state(null);

	queue: Track[] = [];
	track: Track = $state(randomElement(trackData));

	constructor() {
		// sync to local storage
		this.volume = floatFromStorage('volume', 0.2);
	}

	init(audio: HTMLAudioElement) {
		this.audio = audio;
		this.volume = 0.2;

		audio.ondurationchange = () => {
			this.duration = audio.duration;
		};

		audio.ontimeupdate = () => {
			this.currentSeconds = audio.currentTime;
		};

		audio.onpause = () => {
			this.paused = true;
		};

		audio.onplay = () => {
			this.paused = false;
		};

		$effect(() => {
			audio.volume = this.volume;
			localStorage.setItem('volume', this.volume.toString());
		});

		return this.load(this.track);
	}

	// load from a URL
	async load(track: Track) {
		const src = trackAudio(track.id);

		console.info(`Loading track ${track.id} from ${src}`);

		this.audio.src = src;
		this.lyrics = (await resolveLyrics(track)) ?? LYRICS_PLACEHOLDER;
	}

	// toggles if the track is active. otherwise, starts it
	toggle(track: Track, play = false) {
		if (this.track?.id !== track.id) {
			this.load(track);
			player.play();

			this.track = track;

			return;
		}

		if (!this.paused) {
			if (play) {
				this.seek(0);
				this.play();
			} else {
				this.pause();
			}
		} else {
			this.play();
		}
	}

	play() {
		return this.audio.play();
	}

	pause() {
		this.audio.pause();
	}

	// set the current time in seconds
	seek(seconds: number) {
		this.audio.currentTime = seconds;
	}
}

export async function resolveLyrics(track: Track) {
	return trackLyrics(track.id) ?? null;
}

export const player: Player = $state(new Player());

export const settings: TrackSettings = $state({
	lyrics: 'off',
	loop: 'none',
	shuffle: 'off'
});

export const global = $state({
	search: ''
});
