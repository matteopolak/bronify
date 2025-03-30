import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const TRACKS_DIR = 'src/lib/content/tracks';

type InvertedIndex = Map<string, Set<number>>;

function normalizeWord(word: string): string {
	return word
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]/gi, '');
}

function addToIndex(index: InvertedIndex, word: string, trackId: number): void {
	if (!index.has(word)) {
		index.set(word, new Set());
	}
	index.get(word)!.add(trackId);
}

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

const trackData = JSON.parse(readFileSync('src/lib/content/tracks.json', 'utf-8'));

function buildIndex(): InvertedIndex {
	const index: InvertedIndex = new Map();

	const trackDirs = readdirSync(TRACKS_DIR);

	for (const trackId of trackDirs) {
		const track = trackData.find((t: { id: string }) => t.id === trackId);
		console.log(track, trackId);
		const lyricsPath = join(TRACKS_DIR, trackId, 'lyrics.json');
		if (!existsSync(lyricsPath)) continue;

		let data: Lyrics;
		try {
			data = JSON.parse(readFileSync(lyricsPath, 'utf-8'));
		} catch (e) {
			console.warn(`Error reading ${lyricsPath}:`, (e as Error).message);
			continue;
		}

		for (const segment of data) {
			for (const wordObj of segment.words) {
				const words = wordObj.text.split(/\s+/);
				for (const word of words) {
					const norm = normalizeWord(word);
					if (norm.length > 1 || norm === 'i' || norm === 'a') {
						addToIndex(index, norm, track.index);
					}
				}
			}
		}
	}

	return index;
}

function writeIndexToFile(
	index: InvertedIndex,
	outPath = 'src/lib/content/lyrics_index.json'
): void {
	const output: Record<string, number[]> = {};

	for (const [word, songIds] of index.entries()) {
		output[word] = [...songIds];
	}

	console.log(output);

	writeFileSync(outPath, JSON.stringify(output), 'utf-8');
	console.log(`✔ Inverted index written to ${outPath}`);
}

const index = buildIndex();
writeIndexToFile(index);
