import { trackData, trackKaraoke } from './get';

import { trackAudio, trackLyrics } from './get';
import type { Lyrics, Track, TrackSettings } from './types';
import { browser } from '$app/environment';
import { randomElement } from './util';
import { untrack } from 'svelte';

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
	karaoke = $state(false);

	lyrics: Lyrics | null = $state(null);

	queue: Track[] = [];
	track: Track = $state(randomElement(trackData));

	private ctx = 0;

	constructor() {
		// sync to local storage
		this.volume = floatFromStorage('volume', 0.2);
	}

	init(audio: HTMLAudioElement) {
		this.audio = audio;
		this.volume = 0.5;

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

		$effect(() => {
			const _ = this.karaoke;

			untrack(() => {
				const oldTime = this.audio.currentTime;
				const paused = this.audio.paused;

				this.audio.src = this.karaoke ? trackKaraoke(this.track.id) : trackAudio(this.track.id);
				this.audio.currentTime = oldTime;

				if (paused) {
					this.audio.pause();
				} else {
					this.audio.play();
				}
			});
		});

		return this.load(this.track);
	}

	// load from a URL
	async load(track: Track) {
		const src = this.karaoke ? trackKaraoke(track.id) : trackAudio(track.id);

		console.info(`Loading track ${track.id} from ${src}`);

		this.audio.src = src;

		const ctx = ++this.ctx;
		const lyrics = (await resolveLyrics(track)) ?? LYRICS_PLACEHOLDER;

		if (ctx === this.ctx) {
			this.lyrics = lyrics;
		}
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
