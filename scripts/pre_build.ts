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

// if track has lyrics, it goes first. if equal, sort by id
tracks.sort((a, b) => {
	if (hasLyrics.get(b.id) !== hasLyrics.get(a.id)) {
		return hasLyrics.get(b.id) ? 1 : -1;
	}
	return a.id.localeCompare(b.id);
});

// sort artists by number of tracks. if equal, sort by id
artists.sort((a, b) => {
	if (tracksByArtist.get(b.id)?.length !== tracksByArtist.get(a.id)?.length) {
		return (tracksByArtist.get(b.id)?.length || 0) - (tracksByArtist.get(a.id)?.length || 0);
	}
	return a.id.localeCompare(b.id);
});

fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'), 'utf-8');

fs.writeFileSync('src/lib/content/artists.json', JSON.stringify(artists, null, '\t'), 'utf-8');
