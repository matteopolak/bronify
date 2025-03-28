import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';

const outDir = 'src/lib/content/albums';

const id = process.argv[2];
const url = process.argv[3];

fs.mkdirSync(path.join(outDir, id), { recursive: true });

// parse thumbnail
const stream = await axios.get(url, {
	responseType: 'arraybuffer'
});

const buffer = Buffer.from(stream.data);

// process into 512x512 thumbnail (webp)
const result = await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp().toBuffer();

fs.writeFileSync(path.join(outDir, id, 'thumbnail-64.webp'), result);

const result2 = await sharp(buffer).resize(1920, 1080, { fit: 'cover' }).webp().toBuffer();

fs.writeFileSync(path.join(outDir, id, 'thumbnail.webp'), result2);
