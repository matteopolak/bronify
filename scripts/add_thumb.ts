import sharp from 'sharp';
import fs from 'node:fs';

import axios from 'axios';

const id = process.argv[2];
const path = process.argv[3];

const root = 'src/lib/content/tracks';

async function getAverageColor(buffer: Buffer) {
	const { data } = await sharp(buffer)
		.resize(1, 1) // Resize to 1x1 pixel to get average color
		.raw()
		.toBuffer({ resolveWithObject: true });

	const [r, g, b] = data;
	return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

async function main() {
	const output = `${root}/${id}/thumbnail.webp`;

	let thumbnailRaw: Buffer;

	if (!path.startsWith('http')) {
		thumbnailRaw = fs.readFileSync(path);
	} else {
		const data = await axios.get(path, {
			responseType: 'arraybuffer'
		});
		thumbnailRaw = Buffer.from(data.data);
	}

	const thumbnail = await sharp(thumbnailRaw).resize(512, 512, { fit: 'cover' }).webp().toBuffer();
	const color = await getAverageColor(thumbnail);

	const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

	const track = tracks.find((t) => t.id === id);

	if (!track) {
		console.error(`Track with id ${id} not found`);
		return;
	}

	track.colour = color;

	fs.writeFileSync(output, thumbnail);
	fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'), 'utf-8');
}

main();
