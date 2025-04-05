import crypto from 'node:crypto';
import fs from 'node:fs';
import ffmpeg from 'fluent-ffmpeg';

let input = process.argv[2];

if (!input) {
	console.error('Please provide an audio file path');
	process.exit(1);
}

async function main() {
	// if not mp3, convert to mp3
	if (!input.endsWith('.mp3')) {
		const output = input.replace(/\.[^/.]+$/, '.mp3');

		await new Promise((resolve, reject) => {
			ffmpeg(input).toFormat('mp3').on('end', resolve).on('error', reject).save(output);
		});

		input = output;
	}

	const hash = crypto.createHash('sha256');
	const audio = fs.readFileSync(input);

	hash.update(audio);

	const id = hash.digest('base64url').slice(0, 8);

	console.log(`Hash: ${id}\n\n`);

	fs.mkdirSync(`src/lib/content/tracks/${id}`, { recursive: true });

	fs.writeFileSync(`src/lib/content/tracks/${id}/audio.mp3`, audio);
}

main();
