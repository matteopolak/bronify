export type Album = {
	id: string;
	title: string;
	artist: string;
};

export type Song = {
	id: string;
	title: string;
	artist: string;
	tags: string[];
	album?: string;

	spotify?: string;
	youtube: string;
	appleMusic?: string;
	soundcloud?: string;
	other?: string;

	lyrics: boolean;
};

export type Artist = {
	id: string;
	tiktok?: string;
};

export type TrackSettings = {
	paused: boolean;
	volume: number;
	lyrics: boolean;
	loop: 'one' | 'all' | 'none';
	shuffle: 'on' | 'off';
};
