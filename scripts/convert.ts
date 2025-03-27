import fs from 'node:fs';
import crypto from 'node:crypto';

// get the albums, artists, tracks data
const albumData = JSON.parse(fs.readFileSync('src/lib/content/albums.json', 'utf-8'));
const artistsData = JSON.parse(fs.readFileSync('src/lib/content/artists.json', 'utf-8'));
const tracksData = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

const tracks = fs.readdirSync('src/lib/content/tracks');

const mapping = {};

// we need to rename the folders. instead of the id being a hash of the author + title, we want to hash the audio itself
for (const track of tracks) {
	// `track` is the old id
	const oldId = track;
	// the new id is a hash of the file in `src/lib/content/tracks/${oldId}/audio.mp3`
	const audioPath = `src/lib/content/tracks/${oldId}/audio.mp3`;
	if (!fs.existsSync(audioPath)) {
		console.log(`File ${audioPath} does not exist`);
		continue;
	}

	const hash = crypto.createHash('sha256');
	const audio = fs.readFileSync(audioPath);

	hash.update(audio);

	// use base64 (url safe), 8 characters
	const newId = hash.digest('base64url').slice(0, 8);

	// rename the folder
	const newDir = `src/lib/content/tracks/${newId}`;

	if (fs.existsSync(newDir)) {
		console.log(`Directory ${newDir} already exists`);
		continue;
	}

	fs.renameSync(`src/lib/content/tracks/${oldId}`, newDir);

	mapping[oldId] = newId;
}

// update the albums
for (const album of albumData) {
	album.trackIds = album.trackIds.map((id) => mapping[id]);
}

// update the tracks
for (const track of tracksData) {
	track.id = mapping[track.id];
}

// write back the albums and tracks
fs.writeFileSync('src/lib/content/albums.json', JSON.stringify(albumData, null, 2));
fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracksData, null, 2));
