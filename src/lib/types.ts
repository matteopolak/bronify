export type Track = {
	id: string;
	title: string;
	artist: string;
	tags: string[];
	album?: string;

	durationSeconds: number;

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
	lyrics: boolean;
	loop: 'one' | 'all' | 'none';
	shuffle: 'on' | 'off';
};

export type Collection = {
	id: string;
	title: string;
	subtitle: string;
	cover: string;
	type: 'album' | 'playlist' | 'artist';
	tracks: Track[];
};

export type Album = {
	id: string;
	title: string;
	artist: string;
	trackIds: string[];
};
