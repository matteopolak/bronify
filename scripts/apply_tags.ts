import fs from 'node:fs';

const tracks = JSON.parse(fs.readFileSync('src/lib/content/tracks.json', 'utf-8'));

// read the tag map (results.json)
const tagMap = JSON.parse(fs.readFileSync('results.json', 'utf-8'));

for (const track of tracks) {
	track.tags = tagMap.find((tag) => tag.id === track.id)?.tags || [];
	if (track.tags.length === 0) {
		console.log(`No tags found for track ${track.id}`);
	}
}

// write back the tracks
fs.writeFileSync('src/lib/content/tracks.json', JSON.stringify(tracks, null, '\t'));
fs.unlinkSync('results.json');
