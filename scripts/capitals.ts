import fs from 'node:fs';

const trackIds = fs.readdirSync('src/lib/content/tracks');

export type LyricsWord = {
	text: string;
	start: number;
	end: number;
	index: number;
	started?: boolean;
	ended?: boolean;
};
export type LyricsLine = {
	words: LyricsWord[];
	start: number;
	end: number;
};
export type Lyrics = LyricsLine[];

const allowedToStay = new Set(
	fs
		.readFileSync('scripts/allowed-to-stay.txt', 'utf-8')
		.split('\n')
		.map((l) => l.trim().toLowerCase())
		.filter((l) => l.length > 0)
);

for (const trackId of trackIds) {
	let lyrics: Lyrics;

	try {
		lyrics = JSON.parse(
			fs.readFileSync(`src/lib/content/tracks/${trackId}/lyrics.json`, 'utf-8')
		) as Lyrics;
	} catch (e) {
		console.error(`Error parsing lyrics for track ${trackId}:`, e);
		continue;
	}

	for (const line of lyrics) {
		for (const word of line.words) {
			// add if it's capital
			let part = word.text.trim().split(/[^A-Za-z]/)[0];

			if (part.length > 0 && part[0].toLowerCase() !== part[0]) {
				part = part.toLowerCase();
				if (!allowedToStay.has(`+${part}`)) allowedToStay.add(`-${part}`);
			}
		}
	}
}

// write back the allowedToStay
fs.writeFileSync('scripts/allowed-to-stay.txt', Array.from(allowedToStay).join('\n'));
