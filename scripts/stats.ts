import fs from 'node:fs';

const trackCount = fs.readdirSync('src/lib/content/tracks').length;
const artistCount = fs.readdirSync('src/lib/content/artists').length;
const albumCount = fs.readdirSync('src/lib/content/albums').length;

console.log(`Tracks: ${trackCount}`);
console.log(`Artists: ${artistCount}`);
console.log(`Albums: ${albumCount}`);

console.log('\n\n');
