import fs from 'node:fs';
import sharp from 'sharp';
import Color from 'color';

async function getAverageColor(buffer: Buffer) {
	const { data } = await sharp(buffer).resize(1, 1).raw().toBuffer({ resolveWithObject: true });

	const [r, g, b] = data;
	let color = Color.rgb(r, g, b);

	// Convert to HSL to check lightness
	const lightness = color.hsl().lightness();

	// If too light, darken it
	if (lightness > 60) {
		color = color.darken((lightness - 60) / 100); // tweak factor as needed
	}

	return color.hex();
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
