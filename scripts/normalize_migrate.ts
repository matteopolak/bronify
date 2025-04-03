import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

const oldToNewId: Record<string, string> = {};

for (const track of tracks) {
	// old id
	const id = track.id;

	// normalize audio
	execFileSync(
		'uv',
		[
			'run',
			'ffmpeg-normalize',
			`../src/lib/content/tracks/${id}/audio.mp3`,
			'-o',
			`../src/lib/content/tracks/${id}/audio-normalized.mp3`,
			'-c:a',
			'libmp3lame',
			'-b:a',
			'192k'
		],
		{
			cwd: 'scripts'
		}
	);

	// compute new id
	const hash = crypto.createHash('sha256');
	const file = fs.readFileSync(`src/lib/content/tracks/${id}/audio-normalized.mp3`);

	hash.update(file);

	const newId = hash.digest('base64url').slice(0, 8);

	// rename audio
	fs.unlinkSync(`src/lib/content/tracks/${id}/audio.mp3`);
	fs.renameSync(
		`src/lib/content/tracks/${id}/audio-normalized.mp3`,
		`src/lib/content/tracks/${id}/audio.mp3`
	);

	// move folder
	fs.renameSync(`src/lib/content/tracks/${id}`, `src/lib/content/tracks/${newId}`);

	// update id
	track.id = newId;
}

const albums = JSON.parse(fs.readFileSync('src/lib/content/albums.json', 'utf-8'));

for (const album of albums) {
	album.trackIds = album.trackIds.map((track: string) => {
		return oldToNewId[track] ?? track;
	});
}

fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'));
fs.writeFileSync('src/lib/content/albums.json', JSON.stringify(albums, null, '\t'));
