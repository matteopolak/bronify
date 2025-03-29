import fs from 'node:fs';
import path from 'node:path';

const base = 'src/lib/content/tracks';
const tracks = fs.readdirSync(base);

export type LyricsWord = {
	text: string;
	start: number;
	end: number;
	index: number;
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
		.map((l) => l.trim())
		.filter((l) => l.length > 0)
);

function canStartLine(text: string) {
	// must be uppercase
	if (text[0].toLowerCase() === text[0]) {
		return false;
	}

	return true;
}

function mustStartLine(text: string) {
	// must be uppercase
	if (text[0].toLowerCase() === text[0]) {
		return false;
	}

	const canSkip = allowedToStay.has(text.split(/[^A-Za-z]/)[0]);

	return !canSkip;
}

function cleanWord(text: string) {
	if (text.endsWith('.')) {
		text = text.slice(0, -1);
	}

	return text.replace(/\bgoat\b/g, 'GOAT');
}

for (const track of tracks) {
	if (!fs.existsSync(path.join(base, track, 'lyrics.json'))) {
		console.log(`Missing lyrics for ${track}`);
		continue;
	}

	const lyrics: Lyrics = JSON.parse(
		fs.readFileSync(path.join(base, track, 'lyrics.json'), 'utf-8')
	);

	// convert timestamps in words to absolute
	for (const line of lyrics) {
		for (const word of line.words) {
			word.start += line.start;
			word.end += line.start;
		}
	}

	// flatten all lyrics
	const flattened = lyrics.flatMap((l) => l.words);

	// if the gap is larger than this, make a new line
	const SPLIT_TIME_THRESHOLD = 0.39;

	let start = -1;
	let end = 0;
	let words: LyricsWord[] = [];

	const newLyrics: Lyrics = [];

	let lastEnd = 0;
	let lastEndedWithSpace = false;

	for (const word of flattened) {
		word.text = cleanWord(word.text);

		const currentStartsWithSpace = word.text.startsWith(' ');
		const noSpace = !lastEndedWithSpace && !currentStartsWithSpace;

		const wordEnd = word.end;

		if (word.end === start || (word.start === start && words.length)) {
			// merge it
			const lastWord = words[words.length - 1];

			lastWord.end = wordEnd;
			lastWord.text += word.text;

			continue;
		}

		if (
			canStartLine(word.text) &&
			(mustStartLine(word.text) || noSpace || word.start - lastEnd > SPLIT_TIME_THRESHOLD)
		) {
			if (words.length > 0) {
				// remove trailing commas and spaces from last word
				const lastWord = words[words.length - 1];

				lastWord.text = lastWord.text.trimEnd();

				if (lastWord.text.endsWith(',')) {
					lastWord.text = lastWord.text.slice(0, -1);
					lastWord.end -= 0.1;
				}

				newLyrics.push({
					words,
					start,
					end
				});

				start = -1;
			}

			start = word.start;
			end = word.end;
			word.start = 0;
			word.end -= start;
			words = [word];
		} else {
			end = Math.max(end, word.end);
			word.start -= start;
			word.end -= start;
			words.push(word);
		}

		lastEnd = wordEnd;
		lastEndedWithSpace = word.text.endsWith(' ');
	}

	if (words.length > 0) {
		const lastWord = words[words.length - 1];

		lastWord.text = lastWord.text.trimEnd();

		if (lastWord.text.endsWith(',')) {
			lastWord.text = lastWord.text.slice(0, -1);
			lastWord.end -= 0.1;
			lastWord.end = Math.max(0, lastWord.end);
		}

		newLyrics.push({
			words,
			start,
			end
		});
	}

	// limit the time to 2 decimal places
	for (const line of newLyrics) {
		line.start = Math.round(line.start * 100) / 100;
		line.end = Math.round(line.end * 100) / 100;

		for (const word of line.words) {
			word.start = Math.round(word.start * 100) / 100;
			word.end = Math.round(word.end * 100) / 100;
		}
	}

	// renumber them
	let index = 0;

	for (const line of newLyrics) {
		for (const word of line.words) {
			word.index = index++;
			word.end = Math.max(word.end, 0);
			word.start = Math.max(word.start, 0);
		}
	}

	const outputFile = path.join(base, track, 'lyrics.json');
	fs.writeFileSync(outputFile, JSON.stringify(newLyrics, null, '\t'));
	console.log(`Wrote ${outputFile}`);
}
