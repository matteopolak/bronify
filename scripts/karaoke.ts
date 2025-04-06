import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

async function main() {
	for (const track of tracks) {
		const karaokePath = `src/lib/content/tracks/${track.id}/karaoke.mp3`;

		const demucsPath = `scripts/separated/htdemucs/${track.id}/no_vocals.mp3`;

		if (!fs.existsSync(demucsPath)) {
			console.log(`Need demucs for ${track.id}`);
			continue;
		}

		if (!fs.existsSync(karaokePath)) {
			fs.copyFileSync(demucsPath, karaokePath);
		}
	}
}

main();
