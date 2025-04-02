import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));
const albums = JSON.parse(fs.readFileSync('src/lib/content/albums.json', 'utf-8'));
const artists = JSON.parse(fs.readFileSync('src/lib/content/artists.json', 'utf-8'));

for (const track of tracks) {
	const artist = artists.find((a) => a.username === track.artist);

	track.artist = artist.id;
}

for (const album of albums) {
	const artist = artists.find((a) => a.username === album.artist);

	if (artist) album.artist = artist.id;
}

fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, 2));
fs.writeFileSync('src/lib/content/albums.json', JSON.stringify(albums, null, 2));
