import fs from 'node:fs';
import path from 'node:path';

const base = 'src/lib/content/tracks';
const tracks = fs.readdirSync(base);

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
	text = text.trim();

	// must be uppercase
	if (text[0].toLowerCase() === text[0]) {
		return false;
	}

	if (/^A\b/.test(text)) return true;

	const canSkip = allowedToStay.has('+' + text.split(/[^A-Za-z]/)[0].toLowerCase());

	return !canSkip;
}

const wordReplacements = {
	goat: 'GOAT',
	bronn: 'Bron',
	brawn: 'Bron',
	ron: 'Bron',
	bronnis: "Bronny's",
	bonnie: 'Bronny',
	glace: 'glaze',
	bronya: 'Bron ya',
	raymo: 'Raymond'
};

const wordReplacementsRegex = {};

for (const key of Object.keys(wordReplacements)) {
	wordReplacementsRegex[key] = new RegExp(`\\b${key}\\b`, 'gi');
}

function cleanWord(text: string) {
	if (text.endsWith('.')) {
		text = text.slice(0, -1);
	}

	for (const [key, value] of Object.entries(wordReplacements)) {
		text = text.replace(wordReplacementsRegex[key], value);
	}

	return text;
}

const weirdRepetitionRegex = /^([^,\s]+)(?:[, ]*\1){4,}$/;

const skipLyrics: string[] = JSON.parse(fs.readFileSync('scripts/skip_lyrics.json', 'utf-8'));

const skipWord = ['Subtitles by the', 'Amara.org community'];

for (const track of tracks) {
	if (!fs.existsSync(path.join(base, track, 'lyrics.json'))) {
		console.log(`Missing lyrics for ${track}`);
		if (!skipLyrics.includes(track)) skipLyrics.push(track);
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
	const flattened = lyrics.flatMap((l) => {
		const words = l.words;
		words[0].started = true;
		words[words.length - 1].ended = true;
		return words;
	});

	// if the gap is larger than this, make a new line
	const SPLIT_TIME_THRESHOLD = 0.39;

	let start = -1;
	let end = 0;
	let words: LyricsWord[] = [];

	const newLyrics: Lyrics = [];

	let lastEnd = -1;
	let lastStart = -1;
	let lastEndedWithSpace = false;

	let weirdRepetitionCount = 0;

	for (const word of flattened) {
		if (skipWord.includes(word.text)) {
			continue;
		}

		word.text = cleanWord(word.text);

		if (!word.text) {
			continue;
		}

		if (weirdRepetitionRegex.test(word.text)) {
			weirdRepetitionCount++;
		}

		const currentStartsWithSpace = word.text.startsWith(' ');
		let noSpace = !lastEndedWithSpace && !currentStartsWithSpace;

		const wordEnd = word.end;
		const wordStart = word.start;

		if (word.end === lastStart || (word.start === lastStart && words.length)) {
			// merge it
			const lastWord = words[words.length - 1];

			lastWord.end = wordEnd;
			lastWord.text += word.text;

			continue;
		}

		const canStart = canStartLine(word.text);
		const mustStart = mustStartLine(word.text);

		if (canStart && noSpace && words.length > 0) {
			// add space to previouis word
			const lastWord = words[words.length - 1];
			lastWord.text += ' ';
			noSpace = false;
			lastEndedWithSpace = true;
		}

		if (canStart && (mustStart || noSpace || word.start - lastEnd > SPLIT_TIME_THRESHOLD)) {
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
		lastStart = wordStart;
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
		for (const [idx, word] of line.words.entries()) {
			word.index = index++;
			word.end = Math.max(word.end, 0);
			word.start = Math.max(word.start, 0);

			// add a space to the previous word if doesnt exist
			if (idx > 0 && word.started && !line.words[idx - 1]?.text.endsWith(' ')) {
				line.words[idx - 1].text += ' ';
			}

			word.started = undefined;
			word.ended = undefined;
		}
	}

	const outputFile = path.join(base, track, 'lyrics.json');
	fs.writeFileSync(outputFile, JSON.stringify(newLyrics, null, '\t'));

	if (weirdRepetitionCount > 0) {
		console.log(
			`Weird repetition in ${track}: ${weirdRepetitionCount} lines with weird repetition`
		);
	}
}

fs.writeFileSync('scripts/skip_lyrics.json', JSON.stringify(skipLyrics, null, '\t'));
