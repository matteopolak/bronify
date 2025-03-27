import readline from 'node:readline/promises';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

async function main() {
	const links = fs
		.readFileSync('links.txt', 'utf-8')
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true
	});

	const out = [];
	const artists = [];

	const seenVideos = new Set();

	for (const link of links) {
		const info = runYtdlpSync(['-j', link]);
		const song = JSON.parse(info);

		if (seenVideos.has(song.id)) {
			console.log(`Already seen video ${song.id}`);
			continue;
		}

		seenVideos.add(song.id);

		const tiktok = song.uploader;
		let username = song.channel.trim();

		if (username === '') {
			username = tiktok;
		}

		const videoThumbnail = song.thumbnails[0].url;
		const videoTitle = song.title;

		const title = await rl.question(`${videoTitle} - ${link} `);

		// generate hash from title and artist
		const hash = crypto.createHash('sha256');

		hash.update(title);
		hash.update(username);

		const id = hash.digest('hex');

		out.push({
			id,
			artist: username,
			title: title,
			thumbnail: videoThumbnail,
			durationSeconds: song.duration,
			tags: []
		});

		if (!artists.some((artist) => artist.id === username)) {
			artists.push({
				id: username,
				tiktok
			});
		}

		// download audio and put it in "src/lib/content/tracks/{id}/audio.mp3"
		const audioPath = `src/lib/content/tracks/${id}/audio.mp3`;
		const audioDir = `src/lib/content/tracks/${id}`;
		if (!fs.existsSync(audioDir)) {
			fs.mkdirSync(audioDir, { recursive: true });
		}
		if (!fs.existsSync(audioPath)) {
			runYtdlpSync([
				'--extract-audio',
				'--audio-format',
				'mp3',
				'--audio-quality',
				'0',
				'--output',
				audioPath,
				link
			]);

			// copy to ./{id}.mp3
			fs.copyFileSync(audioPath, `${id}.mp3`);
		} else {
			console.log(`Audio already downloaded for ${id}`);
		}
	}

	fs.writeFileSync('out.json', JSON.stringify(out, null, 2));
	fs.writeFileSync('artists.json', JSON.stringify(artists, null, 2));

	// end readline
	rl.close();
}

// run command and return stdout
function runYtdlpSync(options: string[]) {
	const result = execFileSync('yt-dlp', options, {
		stdio: ['pipe', 'pipe', 'ignore']
	});

	return result.toString();
}

main();
