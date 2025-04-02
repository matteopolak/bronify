import fs from 'node:fs';
import crypto from 'node:crypto';

const artists = JSON.parse(fs.readFileSync('src/lib/content/artists.json', 'utf-8')) as {
	id: string;
}[];

const newThumbRoot = 'src/lib/content/artists2';

fs.mkdirSync(newThumbRoot, { recursive: true });

for (const artist of artists) {
	const thumbnail = fs.readFileSync(`src/lib/content/artists/${artist.id}.webp`);

	const hash = crypto.createHash('sha256');

	hash.update(thumbnail);

	const id = hash.digest('base64url').slice(0, 8);

	fs.copyFileSync(`src/lib/content/artists/${artist.id}.webp`, `${newThumbRoot}/${id}.webp`);

	artist.username = artist.id;
	artist.id = id;
}

fs.writeFileSync('src/lib/content/artists.json', JSON.stringify(artists, null, 2));

fs.rmdirSync('src/lib/content/artists', { recursive: true });
fs.renameSync(newThumbRoot, 'src/lib/content/artists');
