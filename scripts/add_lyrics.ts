import fs from 'node:fs';

const id = process.argv[2];
const path = process.argv[3];

const lyrics = fs.readFileSync(path, 'utf-8');

const root = 'src/lib/content/tracks';
const output = `${root}/${id}/lyrics.srt`;

fs.writeFileSync(output, lyrics);
