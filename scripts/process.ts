import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

import axios from 'axios';
import sharp from 'sharp';
import Fuse from 'fuse.js';

type Album = {
	id: string;
	title: string;
	artist: string;
	thumbnail?: string;
	trackIds: string[];
};

type Song = {
	id?: string;
	title: string;
	artist: string;
	thumbnail?: string;
	tags: string[];
	album?: string;

	durationSeconds: number;

	spotify?: string;
	youtube?: string;
	appleMusic?: string;
	soundcloud?: string;
	other?: string;

	lyrics?: boolean;
};

type Artist = {
	id: string;
	thumbnail?: string;
	tiktok?: string;
	soundcloud?: string;
};

const albums: Album[] = [
	{
		id: 'le-album',
		title: 'LeAlbum',
		artist: 'LeBron James',
		thumbnail:
			'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRNG5az_vgnLGH4QtfTD-5entqo3kpLrkhqgaBLs1iaCnPLTub-Ui_R0EQKQKKg0MgIGvHO4nHgpFUBM80',
		trackIds: [
			'e71181ef400310f217dd75d47c62023987fc8e8e60e4c85758837dcd9b555e6f',
			'bde135476656a10dde7c2c70d5805df96d0f2274ee481f66c504b83238fe49bd',
			'8eab7c7074850e1966735106d0d64ec38480d75dd8e1128629e295ed3cbc9641',
			'de9fb6528946b3abb404e7544b86f5078be5e53ad0bd922ff3f8c5fa7f054fc5',
			'973592b2f6d4a38bd42c4b771a0bd532f55b7b841ebe9ab298343939514041fb'
		]
	}
];

const artists: Artist[] = [
	{
		id: 'cklipped 🔌',
		tiktok: 'cklipped',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/aa655386bd26afe4a6f934b8de5a2ba5~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=e8ba96c1&x-expires=1743278400&x-signature=q0Inrl4Wt5NRSo40aZ1MjKfoKKY%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'charlie',
		tiktok: 'ch0bes',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/ee61ce31a0a33687a1187d9e3d9650a7~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=80e976da&x-expires=1743278400&x-signature=ClO49a1qtHrX0Uj%2FMiehYyVeZA8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Hunter',
		tiktok: 'h.unter_15',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/9698696dff50383dc4e898d6eeabe3ab~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=efb1d6d7&x-expires=1743278400&x-signature=kDWWDgFO7Xg7EeVL3gqO%2FvBgee8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Lil Zay',
		tiktok: 'lill_zay',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/65e53215c9abd4d6c9546ba840018911~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=73fbaec7&x-expires=1743278400&x-signature=6xcHzBkvgPFDGGCOgG5Q0dphJE8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Vi$hy',
		tiktok: 'vishy.uhh',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/27f35425df8bfb08f374630354b6af72~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=25c11f0c&x-expires=1743278400&x-signature=52QQiD79Nr2gpgm43bd6NkXUMQo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'maynburneracc',
		tiktok: 'maynburneracc',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/1cb0be50a9a9afb3c49f7d7a8cefc33c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=fcc6740c&x-expires=1743278400&x-signature=5Xo0ss5VZcnLrMY4I4gj3wFuink%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'swasticles',
		tiktok: 'swasticles',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/c0b2c444456bb1d8ef12a724a7b7b9b3~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1e8319b9&x-expires=1743278400&x-signature=UZofH91x9SRiXieGqB8VuzGXrFE%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'NOJO',
		tiktok: 'realnojo',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/27e337a6143c83e51d89568279e0ec43~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=aa75aa47&x-expires=1743278400&x-signature=w4Jj9G7fp%2BXMEVZwB0iRtRIx6Ac%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'ayeeDevon',
		tiktok: 'ayeedevon',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/469622ef4950c411b88e2d50ada6a2da~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=cb8a03dc&x-expires=1743278400&x-signature=LFGu1uRYit%2Fbs8DAsJk3vRdMr60%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Pierce Jackson',
		tiktok: 'piercekjackson',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/533dfa2e15cb5e0201b9cc3d3995db6b~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=22a882f0&x-expires=1743278400&x-signature=nW9wZOirYF2V5wMZQAIhTeh%2BA%2Fc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'yaa2wavy',
		tiktok: 'yaa2wavy',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/52d7c0c1168b32998ee7d0f750ad35a9~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=5e06ec2e&x-expires=1743278400&x-signature=T73%2BrC9ReWtpJ%2BMdzESe3nYz3Cc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Aidan Peterson',
		tiktok: 'atp200520',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7347893323555684398~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=6150750e&x-expires=1743278400&x-signature=5KLbDSPbUvGD%2BtoFd2rB0hvnH%2Bg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'The Ussies',
		tiktok: 'theussiess',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/e4d8848ec35adbefed4b5bc6ba1f3ca9~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=b9013c1e&x-expires=1743278400&x-signature=fadgYM3avgDrt73DkthwnLLR70k%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: '0e12_1',
		tiktok: '0e12_1',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d10be91af18d38acc3f165684091ab45~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=27c79095&x-expires=1743278400&x-signature=ChdAS8ryVxXOzqVhlToqK%2B0cCaw%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Plan B',
		tiktok: 'okayplanb',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d95468660dd33d80ae18c0b574c9eb2d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=d44a07bb&x-expires=1743278400&x-signature=ZMBnhBXohy2y8ZIKE63wtxnVjW0%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Alex',
		tiktok: 'nacuri',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/3a17ab744b86fb847936e1f753369065~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=07507e31&x-expires=1743278400&x-signature=8j7QlE%2BhK6%2FV5wqouiwuuU9yV3M%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Ghivio',
		tiktok: 'omgitsnotjane',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/79c3d20f9904d71715dcda805be01181~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=82702a80&x-expires=1743278400&x-signature=YeqlD9RSSdB7e84bslRZBR6iH6A%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'nykell',
		tiktok: 'luhnykell',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/3fca12a27b1b2831dbe95f2122282c1e~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=e3cf6c19&x-expires=1743278400&x-signature=k%2BJq2RnUFdxw9X5wPqS0re7LJ%2Bw%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Mo The Aries 🕷️',
		tiktok: 'mo_the_aries',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/c386cb2cfce3e3dcfc25c089c50f695c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=fcec4694&x-expires=1743278400&x-signature=9GdDgvPcdYpM0rJsQkvsZquwd%2Fg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Jonn🍄',
		tiktok: 'featjon',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/8cfe077d9b5fea8d1a0926f93b94b6e0~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=d3aa9953&x-expires=1743278400&x-signature=nHl8pVordHr7xclYmsMGXKcfxys%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'SKAR!',
		tiktok: 'skaridasoldier',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/a813679917332444d111dcb123db3333~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=0d98db46&x-expires=1743278400&x-signature=Mn%2FaPAQ7rn5JgBK0qcCbuzq%2FIJo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: '𝚂𝚊𝚛𝚋𝚛𝚘𝚗𝚑𝚊𝚎 ˚ʚ♡ɞ˚',
		tiktok: 'sarbronhae',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/4cc41de2929618c3f249472c6c38a8d2~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=dc1c7806&x-expires=1743278400&x-signature=RVXcbWB%2F7PXYIa7BYZ%2FKWwSPM%2BY%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'JJ Darrow',
		tiktok: 'jxrrxd__',
		soundcloud: 'jxrrxd',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/87106a196901bba58283ae31386753b4~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=ac59cd81&x-expires=1743278400&x-signature=xbrVWfoa5qERDPPjXvvOr126mDg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'elusivexd',
		tiktok: 'elusivexd',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/6d0cf94a1e1d504dcda372745fd0374d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=54ee007e&x-expires=1743278400&x-signature=Qy%2FPCACQhmBSTc39aYX0q3WpkG8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'hail',
		tiktok: 'reinhail',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/dd59c41bbfb41b51ae61e208debdd2b6~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1c93c430&x-expires=1743278400&x-signature=eEZhtib0pBkX6xf4JjtmZpxt8mc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'AJ🇵🇷🏀',
		tiktok: 'ajhudson_official',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/0f2d8f512db1d1d1a70bcc7ec7432368~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=2008d4fe&x-expires=1743278400&x-signature=1Y%2FbBPYFv5SOLOtnO8kyq8bD%2FQI%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Noah Randall',
		tiktok: 'triplecrown113',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/fed7c1556a1152d931fd4c394ecc7ebc~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=a3e7c849&x-expires=1743278400&x-signature=YYIUEm4Aw2W3etHIaWEDguFGshs%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'bekele_labs',
		tiktok: 'bekele_labs',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7352610324748435498~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=fab0f411&x-expires=1743278400&x-signature=sev2lUmzk6uQMaQx8AQH5mbpC50%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'ay3demi (second acc)',
		tiktok: 'ay3demiv2',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/82f762c8dabf122521b02ab08c616451~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=4cebc48b&x-expires=1743278400&x-signature=4FwBWXNlcYebLW%2BqHL9fDEj35co%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Fortnite_lover',
		tiktok: 'minecraft_lover',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/0de38e013fd8f1a1717798fd744fa828~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=2753198b&x-expires=1743278400&x-signature=CxqvnMiPKptpXFqSiDX1%2BNFW2I8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'ymrnando',
		tiktok: 'nandoyoumadethis',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/6129463c69353c29f129e4394f5ee3d0~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=95e6f001&x-expires=1743278400&x-signature=3cqFaNjdbhzkksAVnm6r73P4Zu8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'FNB Gang',
		tiktok: 'fnb.gang8',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/847d2c3a0d67c3d408cecd2a265396e2~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=e20ae3e7&x-expires=1743224400&x-signature=Qgc%2Fvoo%2FTELSSYcZzth4h9%2F3nZo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'nacuri',
		tiktok: 'nacuri',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/3a17ab744b86fb847936e1f753369065~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9216ec2a&x-expires=1743048000&x-signature=S14iR47zUeSGJs0H0kR4YE6O5E8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'izzydrip',
		tiktok: 'izzydrip',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/3742e936d15b655ee65f124265aa13a1~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=99db1472&x-expires=1743048000&x-signature=So99ZUYPVmRrjRBN2dO2sLXBqHM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'kronke',
		tiktok: 'kidkronke',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/3a7b3b2e12314408bd4bdfeedc55f500~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=2807ec3e&x-expires=1743048000&x-signature=gFsKtO9Xsc4iHGzXoAICNkxzsik%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'ilyaugust',
		tiktok: '.ilyaugust',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/952c667ff6205fd0a1dd1cc6a14f7f0f~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=1a2f15ac&x-expires=1743033600&x-signature=%2Fj5s1QzFwBvOgddh2Qc9dl6rarA%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'gouenji',
		tiktok: 'g0uenji',
		thumbnail:
			'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/7320041154731311105~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=42f49685&x-expires=1743033600&x-signature=uP%2B0MxJlWFcV4ZaVKRJ4N7m%2FqPs%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Talented Blake',
		tiktok: 'imakeparodyzz',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/783adb9a9c8f63e0841349c8614f9360~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=64e0ac41&x-expires=1743112800&x-signature=cBsiLh1rLQhDVrwLi%2BR1e%2BW8oBc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'YBG Zakhi',
		tiktok: 'zakhifikes1',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d5186486b4ed55b90864fe36da97930e~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=ed09082d&x-expires=1743253200&x-signature=%2BSY2mV3szMsUiRX3ghpxt95ptas%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'OkaySpade',
		tiktok: 'itsokayspade',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f8cf259178b38bb1f845b8417b8f30a1~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=ea46dd12&x-expires=1743217200&x-signature=8GnInSyd6G2IP%2FrMJeN2WVn9Ixg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'LeFrank Broncean',
		tiktok: 'ajjani444',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/0beff9ca4d89fab302c4fa01c7cd7a1b~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=14ab08f0&x-expires=1743224400&x-signature=RSVXO0e%2FQ6S%2FA9mCnZrllXdWqz8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'ramon angelo',
		tiktok: 'ramonisspicyy',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/d896c8a0eab8730c2753317bb2a5acb5~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=5600437d&x-expires=1743260400&x-signature=Im32WrKExUhyH63np%2Fxq7%2BA03xE%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'josh',
		tiktok: 'joshuacomeaumusic',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/95903f7037b0de314f87d6bb053afc98~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=256bbc8f&x-expires=1743260400&x-signature=R7QzRmLDCZe3uFKrh6reb8%2BthT8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'loveclxrity',
		tiktok: 'loveclxrity',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/b256fa1c6684926028351fc024aa008b~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=06321281&x-expires=1743260400&x-signature=tx6SbhNoqbvtzPN1paThc77nOdM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Kami',
		tiktok: 'kamilol00',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/fae5b1e445a045bd956fd87437bdbb35~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=211e46d1&x-expires=1743260400&x-signature=gwv%2FG%2B5zGZFnwhxneJ4oohNUOw8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'sixer',
		tiktok: 'silversixer',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/4bf5f14ba6b19a03ce9b219ba65d4025~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=aca7ad28&x-expires=1743260400&x-signature=0oZICF3xCO9gOr3wc2nIxYe1u5Q%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	},
	{
		id: 'Trim Ringling 🗣️',
		tiktok: 'timringling',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/a6e278f5439742780af76a3f9cd24279~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=44fd83f1&x-expires=1743264000&x-signature=YLGlHFsxLV4%2B4KGk2F3yZHte4mg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
	}
];

const songs: Song[] = [
	// no lyrics
	{
		id: '96a659daae47193dfb7dd16f701a9ed510b88eb5b9525ca9c8d7b6bfe28d6b79',
		artist: 'ramon angelo',
		title: 'Lakers In 5 (Bruno Mars)',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oAB4iEfIBKjQziwC4FyAADqCi8IiBIMAI9jBhL?lk3s=81f88b70&x-expires=1743260400&x-signature=kXg%2BZ%2F55JOghrXV8g3TndQ99%2F7A%3D&shp=81f88b70&shcp=-',
		durationSeconds: 68,
		tags: []
	},
	{
		id: '1031af25c1157172f0c59e48d96900fcfca546e2a13475c1ac3b1ea7c27826d2',
		artist: 'josh',
		title: 'Life is a Bronway',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/ocjQqQOhAAVLIdqijFfJHPDCqeuSGEIOsK8fBc?lk3s=81f88b70&x-expires=1743260400&x-signature=e0mRzABuIC5tXqveO6ksXIkvgy0%3D&shp=81f88b70&shcp=-',
		durationSeconds: 58,
		tags: []
	},
	{
		id: '4498ee8598bfb51db307f23559cc78e05b112cf12d8a6504c476c3f67d73f0b3',
		artist: 'YBG Zakhi',
		title: 'King LeBron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oUDJI0iHVFp8vLhhBBBAIm84Idzw1ArCJOiIfy?lk3s=81f88b70&x-expires=1743260400&x-signature=2lrgkSEAfX4IA35Lge%2BtZEMFLdw%3D&shp=81f88b70&shcp=-',
		durationSeconds: 60,
		tags: []
	},
	{
		id: '55c7ac41d968dd12ac51258681df21fa0a855e866a8649bd8719f29eaf11382d',
		artist: 'YBG Zakhi',
		title: 'Lakers In 5 (Kanye West)',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/og54Df9hEEHSItbckBngFBYgI1RGAlUfjD6JB2?lk3s=81f88b70&x-expires=1743260400&x-signature=UT6MHTGOBbMReq46jL8%2B3J48aRA%3D&shp=81f88b70&shcp=-',
		durationSeconds: 32,
		tags: []
	},
	{
		id: 'a990688435d54fa1ef752715f991ec267ff5338946d6e879550f06ccaecd61f1',
		artist: 'loveclxrity',
		title: 'Bron Dreams',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oUesfADuW72HBFj0PCSgXDkIAQN7CKqQX24fEU?lk3s=81f88b70&x-expires=1743260400&x-signature=uE21uuy1n2xgO8Bt3ZxaKlvH3Ao%3D&shp=81f88b70&shcp=-',
		durationSeconds: 32,
		tags: []
	},
	{
		id: '994cdc7c9ae8357e11ee773c180fc8a40ee4779ebdb8bd6e7555eaef19682747',
		artist: 'loveclxrity',
		title: 'LeRansom',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oEHzBP4C4k0IIuLjA9gHdfAk9GAesbk3QtugeG?lk3s=81f88b70&x-expires=1743260400&x-signature=9ZZONFPL4YqPXU4vzN7ZM5XfqhE%3D&shp=81f88b70&shcp=-',
		durationSeconds: 36,
		tags: []
	},
	{
		id: '05b895ef8b4872adafa0ae8954196e5b91a98916d0c74e58bfa4c8aec87cac09',
		artist: 'ramon angelo',
		title: 'I Want LeBron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/o8XEpeAGaLtABlRAZeefZEAABII1eAHGQ8uDfJ?lk3s=81f88b70&x-expires=1743260400&x-signature=LNsNPRlpecTTzGpYSO9wsIMFqJ4%3D&shp=81f88b70&shcp=-',
		durationSeconds: 62,
		tags: []
	},
	{
		id: '11912b02187228cc3c8b1b287c384d575c5cf7caabd04b56c62adcd4d64bf30e',
		artist: 'josh',
		title: 'What Makes Bron Beautiful',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/ooK0MeMebGd8eQDd205fQndQEABXgifycgAAL6?lk3s=81f88b70&x-expires=1743260400&x-signature=KoamjBjWY3vyjYSdVlQk6Wxoe0g%3D&shp=81f88b70&shcp=-',
		durationSeconds: 67,
		tags: []
	},
	{
		id: '91e216f0b3609199e567b286b80904e9ef8e28e9ee32005cc41c9b28f5430b76',
		artist: 'josh',
		title: "That's the LeBron Way",
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oYDBrEvTPsVoSIA93AI3iauMHAOKZ597RBg1i?lk3s=81f88b70&x-expires=1743260400&x-signature=1Ogldf%2B2kxdNPbYgGjA9cWhLmkg%3D&shp=81f88b70&shcp=-',
		durationSeconds: 59,
		tags: []
	},
	{
		id: '8aabe6ff8446c67fdd662999a1eb4daea7a59d0cfe69a404cfd9b42fd768a22a',
		artist: 'josh',
		title: 'Bron Bron Bron',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o0yZNyw7fAIIQjLABBIzVCAd9iBpiCZqRPFIF1?lk3s=81f88b70&x-expires=1743260400&x-signature=OKxQLVBQv9jjB67V89oNs62eGUo%3D&shp=81f88b70&shcp=-',
		durationSeconds: 58,
		tags: []
	},
	{
		id: 'c71587bb6a47e9f3f82e5c73e404bdaef7e0fedc0cd2ab60a50ec3f0c8ac68c7',
		artist: 'josh',
		title: 'Bronfriend',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oAAAB1IZEPER9IiY1xKCTvdzwBi03B2NjIV3c?lk3s=81f88b70&x-expires=1743260400&x-signature=ZrhZmvY3he%2BZj8Flc8jricWZt%2B0%3D&shp=81f88b70&shcp=-',
		durationSeconds: 73,
		tags: []
	},
	{
		id: '8e325b1fca01759c3d086f27050013d01ddbf6e50a022b294a3c3a314e5b80bc',
		artist: 'Kami',
		title: 'Like Him',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oc4EerF4qID3RwBAHIPgfPEdnjI4R2GDSE6xEB?lk3s=81f88b70&x-expires=1743260400&x-signature=OWT%2F2QnBp%2FvieWGo5jYU2Gvk1wU%3D&shp=81f88b70&shcp=-',
		durationSeconds: 62,
		tags: []
	},
	{
		id: 'a93693458a85cd0cb6917c41e8fcc1f9b57597a0bd41905972838987931cfd8c',
		artist: 'kronke',
		title: 'LeRude',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/owSBhBEQQHAPYXwfHeFkD23wGKdvYIAtDCfjDv?lk3s=81f88b70&x-expires=1743260400&x-signature=xF0c5AA3ndJOyPdfXYpYNswNBMY%3D&shp=81f88b70&shcp=-',
		durationSeconds: 61,
		tags: []
	},
	{
		id: '8d4f8deccc2725970b0d72d09fdf5b8b8faa392f133a3abab404786044e91437',
		artist: 'sixer',
		title: "Bron's Side",
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oof0QGDs7KqQfALMdchQVQbCUhipAJe3wbfGIe?lk3s=81f88b70&x-expires=1743260400&x-signature=T9qjaOBAKLSuxUpBYXd6g6lc1Go%3D&shp=81f88b70&shcp=-',
		durationSeconds: 51,
		tags: []
	},
	{
		id: '28600be688794c4bf791534c84aee5228111d6abdf2f339ed6b26bf0fbeba38a',
		artist: 'Trim Ringling 🗣️',
		title: 'I Glazed LeBron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oQZABK9D3RBKiopEAqdqEg7GEh6IAvi4QkZgA?lk3s=81f88b70&x-expires=1743260400&x-signature=mtrAJflsoZFl9pXma0EPe9cYkXc%3D&shp=81f88b70&shcp=-',
		durationSeconds: 59,
		tags: []
	},
	{
		id: '54e3b34bfb6568b4f53681a90f726a2410d4c20e233861b31be423804a1f32db',
		artist: 'Aidan Peterson',
		title: 'Accidentally LeBron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/o8iIFwIc2DYMAiB3BAf5inAKAQEKAAlEij7zaC?lk3s=81f88b70&x-expires=1743260400&x-signature=VvezT%2FpO49YgamOp6IJk%2Bf3hZyQ%3D&shp=81f88b70&shcp=-',
		durationSeconds: 45,
		tags: []
	},
	{
		id: '586e614943fca041e06766afa6e0502a3f7a442d19de8ea8f2aaf69fde145ee4',
		artist: 'cklipped 🔌',
		title: 'LeBillionaire',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/ooffK7bNQ12Xf29AfALgdYjfMStUMcDIi8ngwQ?lk3s=81f88b70&x-expires=1743274800&x-signature=wnc6EOFNE6tkH1NmaZxI%2B%2BxOoPo%3D&shp=81f88b70&shcp=-',
		durationSeconds: 47,
		tags: []
	},
	{
		id: '20a51636e136652667c51a64a67eecf13b3a2b73cfa869ebe9ebbbf7d2acb300',
		artist: 'charlie',
		title: "I'm Bron's",
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o0MddA5IbSAOuEInD3FfDCgIOsIAHaEyRADeET?lk3s=81f88b70&x-expires=1743274800&x-signature=345orFb4VltQ5Xn7ZCExy7VW8nA%3D&shp=81f88b70&shcp=-',
		durationSeconds: 57,
		tags: []
	},
	{
		id: 'b6141fda355e8da0442311ee3007356c622ee7755f7768487bdbaffb98413c50',
		artist: 'Hunter',
		title: 'LeBron Weather',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/o0GSIgeGqIJcjFPIYw2eGvIM8EzAeIMALAAxQA?lk3s=81f88b70&x-expires=1743274800&x-signature=2JkEzAcYP95tYEyQGdyQEjkRZNM%3D&shp=81f88b70&shcp=-',
		durationSeconds: 68,
		tags: []
	},
	{
		id: '76f2d55136609ad38d6999882c6b288f3c5a41e399edbcc79ee8b046ffc085c1',
		artist: 'Lil Zay',
		title: 'Party With LeBron James',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oMYO1zgGqEAgZAKnAFAOI5EcfdEDJCDSeDpR3F?lk3s=81f88b70&x-expires=1743274800&x-signature=AdCppIq9lVSs%2BZ5iLddF%2F8u6NbQ%3D&shp=81f88b70&shcp=-',
		durationSeconds: 54,
		tags: []
	},
	{
		id: '14b830bdf1a8d6b9ab8511447f37bfcfa3e269dbf952fc2fb675a35c6bfd8551',
		artist: 'Vi$hy',
		title: 'Let It Bron',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oMFBFAafLcnnFDAfIqMQRXWDgEYES2B0ll3sI8?lk3s=81f88b70&x-expires=1743274800&x-signature=2pn5f8EaScAWkgvw%2BKKEpxv1syQ%3D&shp=81f88b70&shcp=-',
		durationSeconds: 42,
		tags: []
	},
	{
		id: '26f710d47f69df3e67827eef0da2bdcb609634871dae4e688b95f8566886c227',
		artist: 'maynburneracc',
		title: 'Blinding LeBron',
		thumbnail:
			'https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/oo2Ir1vdQ0FIIyvDbe2GeLejm5ALCjaAkKLPQ7?lk3s=81f88b70&x-expires=1743274800&x-signature=CTTeQMSwIu5k5P6gONZCKcHGFCA%3D&shp=81f88b70&shcp=-',
		durationSeconds: 37,
		tags: []
	},
	{
		id: 'c96b839021c967c237191db08a65681f3006a57523d5c2bd1b0964e68972ddfc',
		artist: 'maynburneracc',
		title: 'Save LeBron for Another Day',
		thumbnail:
			'https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/oAfnU5sDVzGpIwiFtTniyCYBAZYA7IIas4yAAC?lk3s=81f88b70&x-expires=1743274800&x-signature=n6PnvvMlf14Q1s1NhHcnRqXJKLE%3D&shp=81f88b70&shcp=-',
		durationSeconds: 55,
		tags: []
	},
	{
		id: '9b4b11c53052fde34258042203593b2094f220f69ac81329d388d39ddc5bb855',
		artist: 'maynburneracc',
		title: 'Moves Like LeBron',
		thumbnail:
			'https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/oIQjMIPA8IsVYbofGLQh5vL2UjBDaAefI4ISIj?lk3s=81f88b70&x-expires=1743274800&x-signature=U9dl1%2F4MV7OdgdJXKAujFMHkuUE%3D&shp=81f88b70&shcp=-',
		durationSeconds: 47,
		tags: []
	},
	{
		id: '5498133f69f7e6f5fb9b4c8fa691536e1088d5a0321bb81ce6c3b66d061452eb',
		artist: 'maynburneracc',
		title: 'LeThriller James',
		thumbnail:
			'https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/oM2ILuLIgQAswe6wgRZ3deBy4AICfDGTPQxjoL?lk3s=81f88b70&x-expires=1743274800&x-signature=IUGLspF9VllWbjDiISiwVtlr5Jw%3D&shp=81f88b70&shcp=-',
		durationSeconds: 29,
		tags: []
	},
	{
		id: '4bd09057e0d81b5fc4796edd10052d930fd8b8169810722c9b6a18de0472f923',
		artist: 'maynburneracc',
		title: "I can't feel my face, tell me LeBron",
		thumbnail:
			'https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/okNAAglTMXFCfAU4KeyZbS6rtgfYiMvvgNfseZ?lk3s=81f88b70&x-expires=1743274800&x-signature=lmYtvbk8wvdZzip3qGRWqNNMc8M%3D&shp=81f88b70&shcp=-',
		durationSeconds: 38,
		tags: []
	},
	{
		id: 'cf38e484ec04f6c294bf415f5a0dd7509c565035cf866eeedec8c45ec9cecfe3',
		artist: 'maynburneracc',
		title: 'LeBron Jean',
		thumbnail:
			'https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/ooQRZknAwlq5gFibDFQmq2FTZfBBQgfzEBEhqu?lk3s=81f88b70&x-expires=1743274800&x-signature=hQF9eSXJc0qnBruBg%2BF5gFN8k%2Fg%3D&shp=81f88b70&shcp=-',
		durationSeconds: 33,
		tags: []
	},
	{
		id: 'a96a36be138ae0d2d96ccec58ffc928eb80156e2ce623b975d425df3a4f220c9',
		artist: 'swasticles',
		title: 'LeBron Changes',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oULkIVAIEwDA5VOFChBernKlodgEREBkIMkaf1?lk3s=81f88b70&x-expires=1743274800&x-signature=p3oZIeJuUB1X4Y%2FY%2FjPwDUEMbyU%3D&shp=81f88b70&shcp=-',
		durationSeconds: 23,
		tags: []
	},
	{
		id: '8f04c0e600c4b38c32ef01c2f5d9b108bbf0aad1476500414d5d96d58890e855',
		artist: 'swasticles',
		title: 'Talking to LeBron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/ooc1XfDKQFA1QuB3sDESU2EyDrGHfRD4nYqWgl?lk3s=81f88b70&x-expires=1743274800&x-signature=BiN5oz5Ltm9DQeBpkVky6hLe%2BjM%3D&shp=81f88b70&shcp=-',
		durationSeconds: 62,
		tags: []
	},
	{
		id: 'aeb0c8420fbbb7d2a4c34d5cbfd46040263d655c24e085064a657c4374548a9d',
		artist: 'NOJO',
		title: 'California James',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o47DAenIbytBuCUXgkS01fiXiEARDA27m78PAE?lk3s=81f88b70&x-expires=1743274800&x-signature=JAH7RoVb89oe%2F8c1BWJdJo%2FD8%2Fo%3D&shp=81f88b70&shcp=-',
		durationSeconds: 34,
		tags: []
	},
	{
		id: 'f78eb7669028dab4663c4c38dd8ec36c263e02b2fa7ec76c8f584a49911cb1b4',
		artist: 'ayeeDevon',
		title: "There's a king inside my bedroom",
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oMb8eFCRVDnD2bETtAAlA3OtEf2tT3EEOjIA7A?lk3s=81f88b70&x-expires=1743274800&x-signature=F1Juc7TMevnHY45gxFm1rOxlmKc%3D&shp=81f88b70&shcp=-',
		durationSeconds: 119,
		tags: []
	},
	{
		id: '61724f7d4f6da095588d38ab1ccc81a62a554a9b906febbfa5a252ac4e28e564',
		artist: 'Pierce Jackson',
		title: 'I Gotta Thank LeBron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/owzIHwYkZQAzvA1vMfPeDfAHSAE0LEDHPIojAF?lk3s=81f88b70&x-expires=1743274800&x-signature=1dY5LBieTm3T1%2B6rLodJVL5h99I%3D&shp=81f88b70&shcp=-',
		durationSeconds: 43,
		tags: []
	},
	{
		id: '32ba026dc86bf23c6f11a1eb9e32a610fbb7cdf7920da3ee65d01567c5217912',
		artist: 'yaa2wavy',
		title: 'LBJ',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oUiIbuId6rF3grBQAwf6iFApBFIg1uSTBt7zoC?lk3s=81f88b70&x-expires=1743274800&x-signature=uluG9XWE9wKhpv89klVnuqZh0ZA%3D&shp=81f88b70&shcp=-',
		durationSeconds: 41,
		tags: []
	},
	{
		id: '87e8bd485460a1e743b2bcd125d822a1ad7384ee8d9bdc1d7d3179a2e71a9380',
		artist: 'Aidan Peterson',
		title: 'Le-Upside Down',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/ocIDkaEAqWAFfEDHDpjt6tfdAeDNIEAILA5PCa?lk3s=81f88b70&x-expires=1743274800&x-signature=GqU3sEhqUs40powp4c%2Bb%2F2EONxc%3D&shp=81f88b70&shcp=-',
		durationSeconds: 28,
		tags: []
	},
	{
		id: '0eb620dfb42ef631e2138179c7fe9087a5da4d8731fbcea111cb5ad98b0ee7fc',
		artist: 'The Ussies',
		title: 'From Le Start',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oI8AgAiIoWBtICwV0DY5iIhBf0pAbzICGVIlqi?lk3s=81f88b70&x-expires=1743274800&x-signature=mBupZopWQnjST7l%2BWSY1KfDCUoU%3D&shp=81f88b70&shcp=-',
		durationSeconds: 58,
		tags: []
	},
	{
		id: 'fd1f57b67dcd17c23ce3fabee48b16fd1524c0236b9abb9597091e9b873081ef',
		artist: 'Lil Zay',
		title: 'LeEveryday',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oE0c9vtZiFjAiYDA9EgAZBaEkKAI4oKBirPui?lk3s=81f88b70&x-expires=1743274800&x-signature=AtUDgsQDjm2iOGCwuKCQqQvTNO4%3D&shp=81f88b70&shcp=-',
		durationSeconds: 32,
		tags: []
	},
	{
		id: 'e4a0f849df41cbbfccd3aad7860aace34f356e9a70a0ff5397f80ca3f6401f36',
		artist: '0e12_1',
		title: 'Mr. LeBrightside',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oc7B9BABTzijPI1iENRJOtCOZZIvXApWmqiVL?lk3s=81f88b70&x-expires=1743274800&x-signature=Zyjsp4ey%2BfDIB7mVwWMhWfZT6ow%3D&shp=81f88b70&shcp=-',
		durationSeconds: 70,
		tags: []
	},
	{
		id: 'b1520c2ea3ebd484a9f2655d35ef4b8bf584862eba862e9c077399ac3c9af80a',
		artist: 'Plan B',
		title: "I'm sorry LeBron, please don't go",
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oUWgieesILADiZDAgMtGQLVreo6Gk3fzic6eKc?lk3s=81f88b70&x-expires=1743274800&x-signature=L49QUGi%2BGUVKO5hg9thoMTTL7h0%3D&shp=81f88b70&shcp=-',
		durationSeconds: 34,
		tags: []
	},
	{
		id: '6fb9625c243633bfdb7c59a25b3ccb61c3699f992cf94e70b93170a88e9f0484',
		artist: 'Alex',
		title: "I'm Just a Glazer",
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o4YCojiesIBTZ3AAbJ2wPLi7zgI8IRTBp94AGA?lk3s=81f88b70&x-expires=1743274800&x-signature=%2Beoz8zmLMKMHYjE%2Bs3sJo%2Fg6AKc%3D&shp=81f88b70&shcp=-',
		durationSeconds: 55,
		tags: []
	},
	{
		id: 'c17692c60aa3a04e614959270da1dc26960ab865754ced7e996bec48593fb971',
		artist: 'Ghivio',
		title: 'G.O.A.T.',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/ooYjjvI2YgeLseq4IJ3z5iAQGeADLICJLCBPcQ?lk3s=81f88b70&x-expires=1743274800&x-signature=ZpDwbhMxD3YmmNZDEUfVt1fY8eQ%3D&shp=81f88b70&shcp=-',
		durationSeconds: 32,
		tags: []
	},
	{
		id: 'ee09e7916a0c18462574273e0931c0769a2e367fd8ca9e853a085a83516a57c9',
		artist: 'nykell',
		title: 'LeSuperpowers',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o4iEn1C7wFoMABSfLnqLRWgTiEQvfDEDQWKZWK?lk3s=81f88b70&x-expires=1743274800&x-signature=btM%2FuyxQjLh2P2kIUomZoe%2FX%2Bds%3D&shp=81f88b70&shcp=-',
		durationSeconds: 60,
		tags: []
	},
	{
		id: '6b0e13622dda305ee4642853db8deff038545276798e40956582aa27b4187175',
		artist: 'Mo The Aries 🕷️',
		title: 'Rather Bron',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oAICbizxbAO0ByBSIf4RHpBwiLZ1y71TpbKAIo?lk3s=81f88b70&x-expires=1743278400&x-signature=pOa%2BGELNOe%2Bh769pkvNNnzgLWjc%3D&shp=81f88b70&shcp=-',
		durationSeconds: 96,
		tags: []
	},
	{
		id: 'af51819acd82dd5f47c4608ffd782eb72fac784a0aabcd9124a2c4c6d3a84437',
		artist: 'Jonn🍄',
		title: 'Like LeBron',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/okCKAeAs1WNGfI3GgPQM5Q8ggGfGAjtYIqmbzj?lk3s=81f88b70&x-expires=1743278400&x-signature=oAyLq8mIX3X92yddYyCkt%2FeKVr4%3D&shp=81f88b70&shcp=-',
		durationSeconds: 61,
		tags: []
	},
	{
		id: '33f07a183113120480fbf586d3ec55356dd2d4486ca51cb76e6202de7ef218df',
		artist: 'SKAR!',
		title: 'LeBaby',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o08iEQfMAeASnQpW8AfMcAAfEacNhcICe1pD1Q?lk3s=81f88b70&x-expires=1743278400&x-signature=evMbQbc680siGT6NzesyL4fYDIU%3D&shp=81f88b70&shcp=-',
		durationSeconds: 59,
		tags: []
	},
	{
		id: '0a436ec10596b8de7257dd1d50708626c5b86e7679f4dba97d8d876f50e52d65',
		artist: '𝚂𝚊𝚛𝚋𝚛𝚘𝚗𝚑𝚊𝚎 ˚ʚ♡ɞ˚',
		title: "Super 'Bron'",
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/osyIwJ7I6nwvB3z4jidlCdibbB36PNAPIAAejp?lk3s=81f88b70&x-expires=1743278400&x-signature=V7eD123xHAlIXeaNcfKRAnvI7NY%3D&shp=81f88b70&shcp=-',
		durationSeconds: 91,
		tags: []
	},
	{
		id: '84e93838f818452dfbdb04d3117b891b66078e7cdd2970b40ca791ee2ea974cf',
		artist: 'Ghivio',
		title: 'Broinson',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oYAECVwIIpnQfBOdjHDBMQEfV5QRE3FA7ObEQD?lk3s=81f88b70&x-expires=1743278400&x-signature=Ad0oVR1rT9mwQ8Ck4L4fwBlhYcI%3D&shp=81f88b70&shcp=-',
		durationSeconds: 46,
		tags: []
	},
	{
		id: 'b98bc94e809dcd88b05a510055fe7106bd4e7a46e33fa62aee72c12e9f9fa758',
		artist: 'NOJO',
		title: 'Love LeBron',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/owgGPvATZXThIE0oDIhHejAAINkFe5AQOAeLjG?lk3s=81f88b70&x-expires=1743278400&x-signature=lTuoe%2B2DjjWsUbwGoxtS3yM6zPw%3D&shp=81f88b70&shcp=-',
		durationSeconds: 57,
		tags: []
	},
	{
		id: '6014d3f494b69a23952895b3061396a6b6b2cdfc9cbd4b3d217798075e1bb0f3',
		artist: 'JJ Darrow',
		title: 'What are you Bronning for?',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/o4Bz8BBwIiAi3z74fCAAInhiukk6jpS7nChIqn?lk3s=81f88b70&x-expires=1743278400&x-signature=mITqsy77STcs9p7UHqXq0rfTp68%3D&shp=81f88b70&shcp=-',
		durationSeconds: 23,
		tags: []
	},
	{
		id: '84e902cb8b021237e8edf6ea31df6aa0bf6faf544143de20f1b72b929ba54dd8',
		artist: 'elusivexd',
		title: 'Al-Bron',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oIXQkQhfAAO6HhaGjLefIPGC1Hw3qIIcPwStCA?lk3s=81f88b70&x-expires=1743278400&x-signature=vRqbcs3oO8qs%2Ft1LEKRpsUhWnv4%3D&shp=81f88b70&shcp=-',
		durationSeconds: 57,
		tags: []
	},
	{
		id: '4109384670037b9c58d324071d8bb342dc5a9c919698577cecc5b885d114102d',
		artist: 'hail',
		title: "Don't (LeRyson Tiller)",
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/osXefeEreIrQpReQWBfviQNzlwItCAgAAY4xkeC?lk3s=81f88b70&x-expires=1743278400&x-signature=VvL9Ymin5HVa4T2NlVQyboHRKfE%3D&shp=81f88b70&shcp=-',
		durationSeconds: 59,
		tags: []
	},
	{
		id: '695d60b9ec0ef84605dc47d9500a6b2011051d152fbf5a80feba614b4f6e4ca6',
		artist: 'AJ🇵🇷🏀',
		title: 'Dear Little Bronny',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/owzCA3sfDjSnFDAfE7uzRP1DgE4ESyAHg04lIA?lk3s=81f88b70&x-expires=1743278400&x-signature=N%2B%2Bj9Y5xaaOZ%2Bca9hc%2BBOT5cm%2F0%3D&shp=81f88b70&shcp=-',
		durationSeconds: 181,
		tags: []
	},
	{
		id: '95a1f06a5b20d276f725cbaa9f37aca421c858c1030716c5a47b0fcf22861cd7',
		artist: 'Noah Randall',
		title: 'LeLuther',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/owMA7BebIAJwZVAC9BIiGPgABEDIwAiRzgBy6P?lk3s=81f88b70&x-expires=1743278400&x-signature=NnvqK4XTU51bzfwFeyxr3NRuOPw%3D&shp=81f88b70&shcp=-',
		durationSeconds: 57,
		tags: []
	},
	{
		id: 'e76e3a91cb1eee2737243118edbe1b383ade1f252a5f2d64056f3b2938a5c1cb',
		artist: 'bekele_labs',
		title: "No One He Can't Defeat",
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/ogIgBJ0PwABi193EZj1y9BxdcUiIi8a4WzF1u?lk3s=81f88b70&x-expires=1743278400&x-signature=Tfvmq1E3GaQ4LcDQPXn8k1wdOTA%3D&shp=81f88b70&shcp=-',
		durationSeconds: 97,
		tags: []
	},
	{
		id: '9090584783aa6af084a0e56dbd0d5759202636d45ada46a5a084b22d55984d2d',
		artist: 'ay3demi (second acc)',
		title: 'SuperBron',
		thumbnail:
			'https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/ooknyBpBzANxYaJiioaZyAIDCB6jf8bw6IIRrs?lk3s=81f88b70&x-expires=1743278400&x-signature=Mkx86Y36mVE1esVlaSIxtvm8ShA%3D&shp=81f88b70&shcp=-',
		durationSeconds: 26,
		tags: []
	},
	{
		id: '7f9b0248a094149a70c34f9d19edd38daa847504034a19789c2d71ddd6453694',
		artist: 'Fortnite_lover',
		title: 'LeBron Can You Please',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oAdCnfPZhwdIBTUIBj7iAVAp6B7iI76HzCRqqD?lk3s=81f88b70&x-expires=1743278400&x-signature=YEZZye%2BqnW8%2BURD7RnQhGXFYAS4%3D&shp=81f88b70&shcp=-',
		durationSeconds: 30,
		tags: []
	},
	{
		id: '0bb995e77428acb6c727bb6077da5c4f0c3d2016c82ad6f764e9f67294aff3d5',
		artist: 'ymrnando',
		title: 'Get Shifty',
		thumbnail:
			'https://p16-sign.tiktokcdn-us.com/obj/tos-useast8-p-0068-tx2/oAQIHFPxfCV1I0DVQf82XqCAEf5YExwKlXNAjt?lk3s=81f88b70&x-expires=1743278400&x-signature=k%2FVOnK1OG2pIObODSlysFsz9Ds4%3D&shp=81f88b70&shcp=-',
		durationSeconds: 37,
		tags: []
	},
	// has lyrics
	{
		title: 'Thinking About Lebron (Frank Ocean Version)',
		artist: 'LeFrank Broncean',
		thumbnail:
			'https://lakersdaily.com/wp-content/uploads/2021/03/USATSI_15649609_168386351_lowres-e1614959679136.jpg',
		tags: ['emotional', 'r&b', 'yearning'],
		durationSeconds: 200
	},
	{
		title: 'LeRansom',
		artist: 'FNB Gang',
		thumbnail:
			'https://e00-marca.uecdn.es/assets/multimedia/imagenes/2021/10/10/16338668190082.jpg',
		tags: ['hip-hop', 'trap', 'hard'],
		durationSeconds: 57
	},
	{
		title: 'LeBron LeBron LeBron James',
		artist: 'OkaySpade',
		thumbnail:
			'https://cdn.vox-cdn.com/thumbor/HWLF1dy07k5fIWm_h9NmDHjQLKs=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19926892/1191304234.jpg.jpg',
		tags: ['high-energy', 'pop', 'anthemic'],
		durationSeconds: 102,

		youtube: 'r2zAt2amp-8'
	},
	{
		title: 'Bring Me Back To Bron',
		artist: 'ilyaugust',
		thumbnail:
			'https://image-cdn.essentiallysports.com/wp-content/uploads/USATSI_24369675.jpg?width=600',
		tags: ['nostalgic', 'emotional', 'mid-tempo'],
		durationSeconds: 62,

		youtube: 'IY_XvFqfzds'
	},
	{
		title: 'Mr. LeBron',
		artist: 'YBG Zakhi',
		tags: ['upbeat', 'pop', 'catchy'],
		durationSeconds: 36,

		youtube: '5KzT6yDXTPo'
	},
	{
		title: "LeBron's Idea",
		artist: 'kronke',
		thumbnail:
			'https://hips.hearstapps.com/hmg-prod/images/lebron-james-of-the-united-states-defended-by-dennis-news-photo-1722010656.jpg?crop=0.88932xw:1xh;center,top&resize=1200:*',
		tags: ['high-energy', 'pop', 'anthemic'],
		durationSeconds: 71,

		youtube: 'LLuoZltZfIU'
	},
	{
		title: "When I See Bron's Face",
		artist: 'nacuri',
		thumbnail:
			'https://a57.foxsports.com/statics.foxsports.com/www.foxsports.com/content/uploads/2024/11/1280/1280/lebronjames.jpg?ve=1&tl=1',
		tags: ['emotional', 'ballad', 'dramatic'],
		durationSeconds: 54,

		youtube: 'd7X6Wx--n8k'
	},
	{
		title: 'LeBronifornia Girls',
		artist: 'izzydrip',
		thumbnail:
			'https://lalweb.blob.core.windows.net/public/lakers/product-marketing/web/player-page/2024-2025/2425_PlayerPage_Headshot_1920x2304_James_LeBron.jpg',
		tags: ['upbeat', 'pop', 'catchy'],
		durationSeconds: 59,

		youtube: 'L9RKIyRA5jE'
	},
	{
		title: 'Lebeauty And A Beat',
		artist: 'kronke',
		thumbnail:
			'https://media.cnn.com/api/v1/images/stellar/prod/230208002315-01b-lebron-james-gallery-restricted.jpg?q=w_3000,c_fill',
		tags: ['high-energy', 'pop', 'anthemic'],
		durationSeconds: 61,

		youtube: 'FG-ASbFCXh4'
	},
	{
		title: 'Let LeBron Know',
		artist: 'ilyaugust',
		thumbnail:
			'https://library.sportingnews.com/styles/crop_style_16_9_desktop/s3/2023-12/GettyImages-1804953858%20%281%29.jpg?h=920929c4&itok=qSPPtKit',
		tags: ['upbeat', 'anthemic', 'motivational'],
		durationSeconds: 38,

		youtube: 'eOugkPrO-Yw'
	},
	{
		title: 'LeBron Hour',
		artist: 'ilyaugust',
		thumbnail:
			'https://st4.depositphotos.com/21607914/23442/i/450/depositphotos_234423390-stock-photo-nba-star-lebron-james-los.jpg',
		tags: ['high-energy', 'hype', 'triumphant'],
		durationSeconds: 37,

		youtube: 'NjvaYclj5f4'
	},
	{
		title: 'Towards The Bron',
		artist: 'ilyaugust',
		thumbnail:
			'https://st4.depositphotos.com/21607914/23637/i/450/depositphotos_236372956-stock-photo-nba-star-lebron-james-cleveland.jpg',
		tags: ['cinematic', 'slow-build', 'inspirational'],
		durationSeconds: 62,

		youtube: '7SlHETBLpOo'
	},
	{
		title: "I'd Catch A LeNade For You",
		artist: 'ilyaugust',
		thumbnail:
			'https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_xl_2x/f_auto/primary/txu5fblpwaeywgda1dct',
		tags: ['emotional', 'ballad', 'dramatic'],
		durationSeconds: 60,

		youtube: 'oEnqveeyids'
	},
	{
		title: "That's Bron",
		artist: 'ilyaugust',
		thumbnail: 'https://uproxx.com/wp-content/uploads/2018/02/bron3.jpg?w=640',
		tags: ['catchy', 'upbeat', 'confident'],
		durationSeconds: 105,

		youtube: 'kbUbLKTzHpE'
	},
	{
		title: 'I Write Brons Not Brongedies',
		artist: 'ilyaugust',
		thumbnail:
			'https://images.news18.com/ibnlive/uploads/2022/12/lebron-james-167231417216x9.jpg?impolicy=website&width=640&height=360',
		tags: ['theatrical', 'high-energy', 'emo-pop'],
		durationSeconds: 114,

		youtube: '_Qgzr4RZnOE'
	},
	{
		title: 'Marry Bron',
		artist: 'ilyaugust',
		thumbnail:
			'https://media-api.xogrp.com/images/a89f2c95-2e3a-44d9-9793-0fa7faac724d~rs_768.h-cr_0.139.1080.1219',
		tags: ['romantic', 'slow-jam', 'sincere'],
		durationSeconds: 61,

		youtube: 'V6i7vkI3dpE'
	},
	{
		title: 'Dunk with a Smile',
		artist: 'gouenji',
		thumbnail: 'https://i.ytimg.com/vi/NwQPDUlJKiI/maxresdefault.jpg',
		tags: ['playful', 'funky', 'feel-good'],
		durationSeconds: 146,

		spotify: '03e1DoLgfvtFGeMqOQRO5g',
		youtube: '-jogTy3Pbz0'
	},
	{
		title: 'Thinking Bout Lebron',
		artist: 'ilyaugust',
		thumbnail: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e84b833ace730c9b3bdbb9d1',
		tags: ['emotional', 'r&b', 'yearning'],
		durationSeconds: 100,

		spotify: '3VKiLsUzx0hT8zLAARxESG',
		youtube: 'UUY_uOSSnYw'
	},
	{
		title: 'I Believe in Lebron',
		artist: 'Talented Blake',
		thumbnail: 'https://i.ytimg.com/vi/t1mTgxXCc9o/maxresdefault.jpg',
		tags: ['inspirational', 'anthemic', 'uplifting'],
		durationSeconds: 164,

		spotify: '0lpp83OLbp8DdTzM7Q9OLi',
		youtube: 't1mTgxXCc9o'
	},
	{
		title: 'Man On The Lakers',
		artist: 'Talented Blake',
		tags: ['moody', 'introspective', 'modern-rock'],
		durationSeconds: 233,

		spotify: '3doVZI24VAUTrXWDTbPTl6',
		youtube: 't3EKsFkxaq4'
	},
	{
		title: 'The LeBron That I Used To Know',
		artist: 'ilyaugust',
		thumbnail:
			'https://www.cantonrep.com/gcdn/authoring/2010/07/07/NREP/ghows-OH-58e8214e-a55b-49ee-bb5c-50cea622d300-225f1f5f.jpeg?width=660&height=788&fit=crop&format=pjpg&auto=webp',
		tags: ['mid-tempo', 'reflective'],
		durationSeconds: 25,

		youtube: 'Ewqz5BFC3L4'
	}
] satisfies Song[];

const outDir = 'src/lib/content';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, 'artists'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'albums'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'tracks'), { recursive: true });

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
		const trackBase = path.join(outDir, 'tracks', id);

		fs.mkdirSync(trackBase, { recursive: true });

		// process into 512x512 thumbnail (webp)
		const result = await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp().toBuffer();

		fs.writeFileSync(path.join(trackBase, 'thumbnail.webp'), result);

		song.thumbnail = undefined;
		// located in static/lyrics/{id}.srt
		song.lyrics = fs.existsSync(path.join(outDir, 'lyrics', `${id}.srt`));

		//fs.copyFileSync(path.join('static', 'lyrics', `${id}.srt`), path.join(trackBase, 'lyrics.srt'));

		// save audio to static/tracks/{id}/audio.mp3
		//const audio = ytdl(song.youtube, { filter: 'audioonly', quality: 'highestaudio' });

		//audio.pipe(fs.createWriteStream(path.join(trackBase, 'audio.mp3')));
		//await new Promise((resolve) => audio.on('end', resolve));
		//fs.writeFileSync(path.join(trackBase, song.youtube), '');
	}

	songs.sort((a, b) => a.id!.localeCompare(b.id!));

	// write songs
	fs.writeFileSync(path.join(outDir, 'tracks.json'), JSON.stringify(songs));

	const index = Fuse.createIndex(['title', 'artist', 'tags', 'username'], songs);

	fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index.toJSON()));

	const seenArtists = new Set<string>();

	for (const artist of artists) {
		if (seenArtists.has(artist.id)) {
			// error
			console.error(`Duplicate artist ${artist.id}`);
			process.exit(1);
		}

		seenArtists.add(artist.id);

		// parse thumbnail
		const stream = await axios.get(artist.thumbnail, {
			responseType: 'arraybuffer',
			validateStatus: () => true
		});
		if (stream.status !== 200) {
			if (!fs.existsSync(path.join(outDir, 'artists', `${artist.id}.webp`)) && artist.thumbnail) {
				throw new Error(`Failed to fetch thumbnail for artist ${artist.id}`);
			} else {
				continue;
			}
		}
		const buffer = Buffer.from(stream.data);

		// process into 512x512 thumbnail (webp)
		const result = await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp().toBuffer();

		fs.writeFileSync(path.join(outDir, 'artists', `${artist.id}.webp`), result);

		artist.thumbnail = undefined;
	}

	artists.sort((a, b) => a.id!.localeCompare(b.id!));

	fs.writeFileSync(path.join(outDir, 'artists.json'), JSON.stringify(artists));

	for (const album of albums) {
		fs.mkdirSync(path.join(outDir, 'albums', album.id), { recursive: true });

		// parse thumbnail
		const stream = await axios.get(album.thumbnail, {
			responseType: 'arraybuffer',
			validateStatus: () => true
		});
		if (stream.status !== 200) {
			if (
				!fs.existsSync(path.join(outDir, 'albums', album.id, 'thumbnail.webp')) &&
				album.thumbnail
			) {
				throw new Error(`Failed to fetch thumbnail for album ${album.id}`);
			} else {
				continue;
			}
		}
		const buffer = Buffer.from(stream.data);

		// process into 512x512 thumbnail (webp)
		const result = await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp().toBuffer();

		fs.writeFileSync(path.join(outDir, 'albums', album.id, 'thumbnail-64.webp'), result);

		const result2 = await sharp(buffer).resize(1920, 1080, { fit: 'cover' }).webp().toBuffer();

		fs.writeFileSync(path.join(outDir, 'albums', album.id, 'thumbnail.webp'), result2);

		album.thumbnail = undefined;
	}
	fs.writeFileSync(path.join(outDir, 'albums.json'), JSON.stringify(albums));
}

main();
