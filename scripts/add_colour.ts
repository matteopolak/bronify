import fs from 'node:fs';
import sharp from 'sharp';

async function getAverageColor(buffer: Buffer) {
	const { data } = await sharp(buffer)
		.resize(1, 1) // Resize to 1x1 pixel to get average color
		.raw()
		.toBuffer({ resolveWithObject: true });

	const [r, g, b] = data;
	return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

async function main() {
	const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

	for (const track of tracks) {
		const thumbnailPath = `src/lib/content/tracks/${track.id}/thumbnail.webp`;
		const thumbnailRaw = fs.readFileSync(thumbnailPath);

		const colour = await getAverageColor(thumbnailRaw);

		track.colour = colour;
	}

	fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'));
}

main();
