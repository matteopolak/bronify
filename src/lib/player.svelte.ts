import { trackData } from './get';

import { trackAudio, trackLyrics } from './get';
import type { Track, TrackSettings } from './types';

export class Player {
	public audio!: HTMLAudioElement;

	duration = $state(0);
	currentSeconds = $state(0);
	volume = $state(1);
	paused = $state(true);

	// lyrics in SRT format
	lyrics: string | null = $state(null);

	queue: Track[] = [];
	track: Track = $state(trackData[0]);

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
		});

		return this.load(this.track);
	}

	// load from a URL
	async load(track: Track) {
		this.audio.src = trackAudio(track.id);

		const lyricsUrl = trackLyrics(track.id);
		if (!lyricsUrl) return;

		const res = await fetch(lyricsUrl);

		if (res.ok) {
			this.lyrics = await res.text();
		} else {
			this.lyrics = null;
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

		this.paused = !this.paused;

		if (this.paused) {
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

export const player: Player = $state(new Player());

export const settings: TrackSettings = $state({
	lyrics: false,
	loop: 'none',
	shuffle: 'off'
});

export const global = $state({
	search: ''
});
