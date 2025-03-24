import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

import axios from 'axios';
import sharp from 'sharp';
import Fuse from 'fuse.js';

type Song = {
	id?: string;
	title: string;
	artist: string;
	username?: string;
	thumbnail?: string;
	tags: string[];

	spotify?: string;
	youtube: string;
	appleMusic?: string;
	soundcloud?: string;
	other?: string;
};

const songs: Song[] = [
	{
		title: 'The LeBron That I Used To Know',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'Ewqz5BFC3L4'
	},
	{
		title: 'Let LeBron Know',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'eOugkPrO-Yw'
	},
	{
		title: 'LeBron Hour',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'NjvaYclj5f4'
	},
	{
		title: 'Towards The Bron',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: '7SlHETBLpOo'
	},
	{
		title: "I'd Catch A LeNade For You",
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'oEnqveeyids'
	},
	{
		title: "That's Bron",
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'kbUbLKTzHpE'
	},
	{
		title: 'I Write Brons Not Brongedies',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: '_Qgzr4RZnOE'
	},
	{
		title: 'Marry Bron',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'V6i7vkI3dpE'
	},
	{
		title: 'Bring Me Back To Bron',
		artist: 'ilyaugust',
		username: '.ilyaugust',
		tags: ['chill', 'lofi'],

		youtube: 'IY_XvFqfzds'
	},
	{
		title: 'Dunk with a Smile',
		artist: 'gouenji',
		username: 'g0uenji',
		thumbnail: 'https://i.ytimg.com/vi/NwQPDUlJKiI/maxresdefault.jpg',
		tags: ['chill', 'lofi'],

		spotify: '03e1DoLgfvtFGeMqOQRO5g',
		youtube: '1C7-wKtDRG0'
	},
	{
		title: 'Thinking Bout Lebron',
		artist: 'DARK MEAT UPC',
		thumbnail: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e84b833ace730c9b3bdbb9d1',
		tags: ['chill', 'lofi'],

		spotify: '3VKiLsUzx0hT8zLAARxESG',
		youtube: 'UUY_uOSSnYw'
	},
	{
		title: 'I Believe in Lebron',
		artist: 'DARK MEAT UPC',
		thumbnail: 'https://i.ytimg.com/vi/t1mTgxXCc9o/maxresdefault.jpg',
		tags: ['chill', 'lofi'],

		spotify: '0lpp83OLbp8DdTzM7Q9OLi',
		youtube: 't1mTgxXCc9o'
	},
	{
		title: 'Towards The Bron',
		artist: 'DARK MEAT UPC',
		thumbnail: 'https://i.ytimg.com/vi/6QRPvIsH88s/maxresdefault.jpg',
		tags: ['chill', 'lofi'],

		spotify: '0izzGvHBiBNMiGPIQP76aW',
		youtube: 'yTMTXh2pT2I'
	},
	{
		title: 'Man On The Lakers',
		artist: 'DARK MEAT UPC',
		thumbnail:
			'https://a57.foxnews.com/static.foxnews.com/foxnews.com/content/uploads/2023/04/896/500/lebron-hyped-playoffs.jpg?ve=1&tl=1',
		tags: ['chill', 'lofi'],

		spotify: '3doVZI24VAUTrXWDTbPTl6',
		youtube: 'Til0sIaxzbY'
	},
	{
		title: 'Thats Bron',
		artist: 'DARK MEAT UPC',
		thumbnail:
			'https://www.usatoday.com/gcdn/presto/2023/04/25/USAT/ae6c67f6-bec1-4f30-aaa9-bb81e0488a51-USP_NBA__Playoffs-Memphis_Grizzlies_at_Los_Angeles_2.jpg',
		tags: ['chill', 'lofi'],

		spotify: '7Dt40sqcEpsyQ43vGyoHsP',
		youtube: '-__U4OTAoDQ'
	},
	{
		title: 'Oh Mister Lebron',
		artist: 'DARK MEAT UPC',
		thumbnail:
			'https://thespun.com/.image/t_share/MjAxODY2ODQyNzgyODM2MDAy/los-angeles-lakers-v-sacramento-kings.jpg',
		tags: ['chill', 'lofi'],

		spotify: '3w327RoLVeZFqs0YttFWQp',
		youtube: 'b1d86TJnjEo'
	},
	{
		title: 'Panic At LeDisco',
		artist: 'DARK MEAT UPC',
		thumbnail:
			'https://phantom-marca.unidadeditorial.es/1e46892a28a1a1e8cb49a2ed030e250d/resize/828/f/jpg/assets/multimedia/imagenes/2024/11/30/17329966091923.jpg',
		tags: ['chill', 'lofi'],

		spotify: '2DXWNVR00eZMyVEQp5qx2y',
		youtube: 's9g_Qo-YgvY'
	},
	{
		title: 'Lebron(aback girl)',
		artist: 'mbthewave',
		username: 'mbthewave',
		tags: ['chill', 'lofi'],

		youtube: 'gYTsoZpx-DI'
	}
	/*
	{
		title: 'LeBron LeBron LeBron James',
		artist: 'jettasnfl',
		username: 'jettasnfl',
		tags: ['chill', 'lofi'],

		youtube: ''
	}
	*/
] satisfies Song[];

const outDir = 'src/lib/content';

// delete directory
try {
	fs.rmSync(outDir, { recursive: true });
} catch {}
// create directory
fs.mkdirSync(outDir, { recursive: true });

async function main() {
	for (const song of songs) {
		// generate hash from title and artist
		const hash = crypto.createHash('sha256');

		hash.update(song.title);
		hash.update(song.artist);

		const id = hash.digest('hex');

		song.id = id;

		// parse thumbnail
		const stream = await axios.get(
			song.thumbnail ?? `https://i.ytimg.com/vi/${song.youtube}/maxresdefault.jpg`,
			{ responseType: 'arraybuffer' }
		);
		const buffer = Buffer.from(stream.data);

		// process into 512x512 thumbnail (webp)
		const result = await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp().toBuffer();

		fs.writeFileSync(path.join(outDir, `${id}.webp`), result);

		// @ts-expect-error - a
		song.thumbnail = undefined;
	}

	songs.sort((a, b) => a.id!.localeCompare(b.id!));

	// write songs
	fs.writeFileSync(path.join(outDir, 'songs.json'), JSON.stringify(songs));

	const index = Fuse.createIndex(['title', 'artist', 'tags', 'username'], songs);

	fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index.toJSON()));
}

main();
