import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

const missing: string[] = [];

for (const track of tracks) {
	const hasLyrics = fs.existsSync(`src/lib/content/tracks/${track.id}/lyrics.json`);

	if (!hasLyrics) {
		console.log(`No lyrics found for track ${track.id}`);
		missing.push(track.id);
	}
}

console.log(`\n\nTotal missing lyrics: ${missing.length}`);

console.log('\n');

fs.writeFileSync('scripts/skip_lyrics.json', JSON.stringify(missing, null, 2));
