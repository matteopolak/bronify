import readline from 'node:readline/promises';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'fluent-ffmpeg';

import sharp from 'sharp';
import axios from 'axios';

const root = 'src/lib/content';

const existingArtists = JSON.parse(fs.readFileSync(path.join(root, 'artists.json'), 'utf-8'));
const existingTracks = JSON.parse(fs.readFileSync(path.join(root, 'tracks.json'), 'utf-8'));

async function downloadImage(url: string, x: number, y: number) {
	const stream = await axios.get(url, {
		responseType: 'arraybuffer',
		validateStatus: () => true
	});

	const buffer = Buffer.from(stream.data);

	// process into 512x512 thumbnail (webp)
	const result = await sharp(buffer).resize(x, y, { fit: 'cover' }).webp().toBuffer();

	return result;
}

async function main() {
	const links = fs
		.readFileSync('links.txt', 'utf-8')
		.split('\n')
		.map((line) => line.trim());

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true
	});

	const out = existingTracks || [];
	const artists = existingArtists || [];

	const seenVideos = new Set();

	for (let i = 0; i < links.length; i++) {
		try {
			fs.rmdirSync('temp', { recursive: true });
		} catch (e) {
			/* ignore */
		}

		fs.mkdirSync('temp', { recursive: true });

		let link = links[i];
		const isPart = link.startsWith('part ');

		if (isPart) {
			link = link.slice(5).trim();
		}

		if (!link) {
			continue;
		}

		if (link === '//') {
			console.log('found breaker, ending');
			break;
		}

		if (link.startsWith('//')) {
			console.log('found comment, skipping');
			continue;
		}

		const info = runYtdlpSync(['-j', link]);
		const song = JSON.parse(info);

		if (song.id && seenVideos.has(song.id)) {
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

		const title = await rl.question(`${link} `);

		if (/\bskip\b/i.test(title)) {
			console.log('Skipping video');
			continue;
		}

		// if starts with `part `, process all audio and merge it together
		if (isPart) {
			const paths = [] as string[];

			for (let j = i; j < links.length; j++) {
				let partLink = links[j];
				console.log('checking ', partLink);

				if (partLink.startsWith('part ')) {
					partLink = partLink.slice(5).trim();
				}

				if (!partLink) {
					continue;
				}

				runYtdlpSync([
					'--extract-audio',
					'--audio-format',
					'mp3',
					'--audio-quality',
					'0',
					'--output',
					`./temp/temp_${j}.mp3`,
					partLink
				]);

				paths.push(`./temp/temp_${j}.mp3`);

				i = j;
			}

			console.log(`Merging ${paths} audio files`);

			mergeMp3Sync(paths, `./temp/temp1.mp3`);
		} else {
			runYtdlpSync([
				'--extract-audio',
				'--audio-format',
				'mp3',
				'--audio-quality',
				'0',
				'--output',
				'./temp/temp1.mp3',
				link
			]);
		}

		try {
			fs.unlinkSync('temp/temp.mp3');
		} catch (e) {
			/* ignore */
		}

		execFileSync(
			'uv',
			[
				'run',
				'ffmpeg-normalize',
				'../temp/temp1.mp3',
				'-o',
				`../temp/temp.mp3`,
				'-c:a',
				'libmp3lame',
				'-b:a',
				'192k'
			],
			{
				cwd: 'scripts'
			}
		);

		// read
		const audio = fs.readFileSync('temp/temp.mp3');

		// generate hash audio
		const hash = crypto.createHash('sha256');

		hash.update(audio);

		const id = hash.digest('base64url').slice(0, 8);

		if (out.some((track) => track.id === id)) {
			console.log(`Already seen track ${id}`);
			continue;
		}

		let artistId = artists.find((artist) => artist.username === username)?.id;

		if (!artistId) {
			const url = await rl.question(
				`What is the avatar url for https://tiktok.com/@${encodeURIComponent(tiktok)} `
			);
			const avatar = await downloadImage(url, 512, 512);

			const hash = crypto.createHash('sha256');

			hash.update(avatar);

			const id = hash.digest('base64url').slice(0, 8);

			fs.writeFileSync(`src/lib/content/artists/${id}.webp`, avatar);

			artists.push({
				id,
				username,
				tiktok
			});

			artistId = id;
		}

		out.push({
			id,
			artists: [artistId],
			title: title,
			durationSeconds: song.duration,
			tags: []
		});

		// download audio and put it in "src/lib/content/tracks/{id}/audio.mp3"
		const audioPath = `src/lib/content/tracks/${id}/audio.mp3`;
		const audioDir = `src/lib/content/tracks/${id}`;
		if (!fs.existsSync(audioDir)) {
			fs.mkdirSync(audioDir, { recursive: true });
		}
		if (!fs.existsSync(audioPath)) {
			fs.copyFileSync('temp/temp.mp3', audioPath);
		} else {
			console.log(`Audio already downloaded for ${id}`);
		}

		const thumbnailPath = `src/lib/content/tracks/${id}/thumbnail.webp`;
		const thumbnailDir = `src/lib/content/tracks/${id}`;
		if (!fs.existsSync(thumbnailDir)) {
			fs.mkdirSync(thumbnailDir, { recursive: true });
		}
		if (!fs.existsSync(thumbnailPath)) {
			const thumbnail = await downloadImage(videoThumbnail, 512, 512);
			fs.writeFileSync(thumbnailPath, thumbnail);
		} else {
			console.log(`Thumbnail already downloaded for ${id}`);
		}

		fs.writeFileSync(path.join(root, 'tracks.json'), JSON.stringify(out, null, '\t'));
		fs.writeFileSync(path.join(root, 'artists.json'), JSON.stringify(artists, null, '\t'));
	}

	try {
		//fs.unlinkSync('./temp.mp3');
	} catch (e) {
		/* ignore */
	}

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

function mergeMp3Sync(paths: string[], output: string) {
	const result = execFileSync('ffmpeg', [
		'-i',
		`concat:${paths.join('|')}`,
		'-acodec',
		'copy',
		output
	]);

	return result;
}

main();
