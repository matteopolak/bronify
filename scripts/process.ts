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
	},
	{
		id: 'Aidan Peterson',
		tiktok: 'atp200520',
		thumbnail:
			'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7347893323555684398~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=d5635877&x-expires=1743264000&x-signature=HQObRatFewMcF6p2Bv9RpxEUY0s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva'
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

	for (const artist of artists) {
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
