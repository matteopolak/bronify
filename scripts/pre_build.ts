import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

const artists = JSON.parse(fs.readFileSync('src/lib/content/artists.json', 'utf-8'));

// sort tracks by id
tracks.sort((a, b) => {
	return a.id.localeCompare(b.id);
});

// sort artists by id
artists.sort((a, b) => {
	return a.id.localeCompare(b.id);
});

fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, 2), 'utf-8');

fs.writeFileSync('src/lib/content/artists.json', JSON.stringify(artists, null, 2), 'utf-8');
