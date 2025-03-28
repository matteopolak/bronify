import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

let total = 0;

for (const track of tracks) {
	const hasLyrics = fs.existsSync(`src/lib/content/tracks/${track.id}/lyrics.srt`);

	if (!hasLyrics) {
		console.log(`No lyrics found for track ${track.id}`);
		total++;
	}
}

console.log(`\n\nTotal missing lyrics: ${total}`);

console.log('\n');
