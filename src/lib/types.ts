export type Track = {
	id: string;
	title: string;
	artists: string[];
	tags: string[];
	album?: string;
	index: number;
	colour: `#${string}`;

	durationSeconds: number;
	createdAt: number;

	spotify?: string;
	youtube?: string;
	appleMusic?: string;
	soundcloud?: string;
	other?: string;
};

export type Artist = {
	id: string;
	username: string;
	display_name?: string;
	tiktok?: string;
	soundcloud?: string;
	spotify?: string;
};

export type TrackSettings = {
	lyrics: 'on' | 'off';
	loop: 'one' | 'all' | 'none';
	shuffle: 'on' | 'off';
};

export type Collection = {
	id: string;
	title: string;
	subtitle: string;
	cover?: string;
	type: 'album' | 'playlist' | 'artist' | 'tag';
	tracks: Track[];
};

export type Album = {
	id: string;
	title: string;
	artist: string;
	trackIds: string[];
};

export type Playlist = {
	id: string;
	title: string;
	tracks: Track[];
};

export type LyricsWord = {
	text: string;
	start: number;
	end: number;
	index: number;
};
export type LyricsLine = {
	words: LyricsWord[];
	start: number;
	end: number;
};
export type Lyrics = LyricsLine[];
