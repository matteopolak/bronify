import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

for (const track of tracks) {
	if (typeof track.artist === 'string') {
		track.artists = [track.artist];
		track.artist = undefined;
	}
}

fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'), 'utf-8');
