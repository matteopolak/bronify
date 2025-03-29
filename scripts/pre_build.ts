import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

const artists = JSON.parse(fs.readFileSync('src/lib/content/artists.json', 'utf-8'));

const tracksByArtist = new Map<string, string[]>();

for (const track of tracks) {
	if (!tracksByArtist.has(track.artist)) {
		tracksByArtist.set(track.artist, []);
	}
	tracksByArtist.get(track.artist)?.push(track.id);
}

const hasLyrics = new Map<string, boolean>();

for (const track of tracks) {
	if (fs.existsSync(`src/lib/content/tracks/${track.id}/lyrics.srt`)) {
		hasLyrics.set(track.id, true);
	}
}

tracks.sort((a, b) => {
	return a.id.localeCompare(b.id);
});

// sort artists by number of tracks. if equal, sort by id
artists.sort((a, b) => {
	if (tracksByArtist.get(b.id)?.length !== tracksByArtist.get(a.id)?.length) {
		return (tracksByArtist.get(b.id)?.length || 0) - (tracksByArtist.get(a.id)?.length || 0);
	}
	return a.id.localeCompare(b.id);
});

let maxIndex = -1;

for (const track of tracks) {
	if (track.index !== undefined) {
		maxIndex = Math.max(maxIndex, track.index);
	}
}

for (const track of tracks) {
	if (track.index === undefined) {
		track.index = ++maxIndex;
	}
}

fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'), 'utf-8');

fs.writeFileSync('src/lib/content/artists.json', JSON.stringify(artists, null, '\t'), 'utf-8');
