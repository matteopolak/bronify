import fs from 'fs';

const albums = JSON.parse(fs.readFileSync('src/lib/content/albums.json', 'utf-8'));
const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));
const tracksOld = JSON.parse(fs.readFileSync('src/lib/content/tracks_old.json', 'utf-8'));

const oldToNewId: Record<string, string> = {};

for (const track of tracks) {
	const oldTrack = tracksOld.find((t: any) => t.index === track.index);

	if (!oldTrack) {
		console.error(`Could not find old track for ${track.id}`);
		continue;
	}

	oldToNewId[oldTrack.id] = track.id;
}

for (const album of albums) {
	album.trackIds = album.trackIds.map((track: string) => {
		return oldToNewId[track];
	});
}

console.log(albums);
fs.writeFileSync('src/lib/content/albums.json', JSON.stringify(albums, null, '\t'));
