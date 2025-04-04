import sharp from 'sharp';
import fs from 'node:fs';

import axios from 'axios';

const id = process.argv[2];
const path = process.argv[3];

const root = 'src/lib/content/tracks';

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

	fs.writeFileSync(output, thumbnail);
}

main();
