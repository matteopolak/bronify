import fs from 'node:fs';
import path from 'node:path';

import { Canvas } from 'skia-canvas';

const outputDir = 'src/lib/content/tags';
const tags = Object.keys(JSON.parse(fs.readFileSync('src/lib/content/tags.json', 'utf-8')));

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

function pastelColorFromString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}

	const hue = Math.abs(hash) % 360;
	const saturation = 70 + (Math.abs(hash) % 10);
	const lightness = 45 + (Math.abs(hash) % 5);

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function hslToRgb(h, s, l) {
	s /= 100;
	l /= 100;

	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

	return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function drawBlob(ctx, cx, cy, r, fillStyle) {
	const points = 8;
	const angleStep = (Math.PI * 2) / points;

	const offsets = Array.from({ length: points }, () => 0.6 + Math.random() * 0.8);

	ctx.beginPath();
	for (let i = 0; i <= points; i++) {
		const angle = i * angleStep;
		const radiusOffset = r * offsets[i % points];
		const x = cx + Math.cos(angle) * radiusOffset;
		const y = cy + Math.sin(angle) * radiusOffset;

		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			const prevAngle = (i - 1) * angleStep;
			const prevRadiusOffset = r * offsets[(i - 1) % points];
			const prevX = cx + Math.cos(prevAngle) * prevRadiusOffset;
			const prevY = cy + Math.sin(prevAngle) * prevRadiusOffset;

			const cpx = (prevX + x) / 2;
			const cpy = (prevY + y) / 2;
			ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
		}
	}
	ctx.closePath();
	ctx.fillStyle = fillStyle;
	ctx.fill();
}

function drawBlobs(ctx, width, height, color) {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);

	const [r, g, b] = hslToRgb(...color.match(/\d+/g).map(Number));
	const blobColor = `rgba(${r}, ${g}, ${b}, 0.6)`;

	for (let i = 0; i < 3; i++) {
		const centerX = Math.random() * width;
		const centerY = Math.random() * height;
		const radius = Math.random() * (width / 5) + width / 10;

		drawBlob(ctx, centerX, centerY, radius, blobColor);
	}
}

async function generateImage(tag, width, height, suffix) {
	const canvas = new Canvas(width, height);
	const ctx = canvas.getContext('2d');

	const color = pastelColorFromString(tag);
	drawBlobs(ctx, width, height, color);

	const fileName = `${tag}-${suffix}.webp`;
	const filePath = path.join(outputDir, fileName);
	const buffer = await canvas.toBuffer('webp');
	fs.writeFileSync(filePath, buffer);
	console.log(`Generated ${filePath}`);
}

(async () => {
	for (const tag of tags) {
		await generateImage(tag, 256, 256, 'thumb');
		await generateImage(tag, 1920, 1080, 'cover');
	}
})();
