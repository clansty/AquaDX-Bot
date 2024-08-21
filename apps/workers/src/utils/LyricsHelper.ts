import Genius from 'genius-lyrics';
import { franc } from 'franc';
import { MediaWikiApi } from 'wiki-saikou';
import { iso6393 } from 'iso-639-3';
import Telegraph from 'telegra.ph';
import tph from 'telegra.ph/typings/telegraph';
import { Song } from '@clansty/maibot-types';

export default class LyricsHelper {
	private readonly geniusClient: Genius.Client;
	private readonly wiki: MediaWikiApi = new MediaWikiApi('https://silentblue.remywiki.com/api.php');
	private readonly telegraph: Telegraph;

	constructor(geniusSecret: string, telegraphSecret: string, private readonly deeplAuthKey: string) {
		this.geniusClient = new Genius.Client(geniusSecret);
		this.telegraph = new Telegraph(telegraphSecret);
	}

	async getLyricsTelegraf(song: Song): Promise<'None' | string> {
		const lyrics = await this.getLyrics(song.title, song.artist);
		if (lyrics === 'None') {
			return 'None';
		}
		return await this.createTelegraphPage(lyrics, song.title, song.coverUrl);
	}

	async getLyrics(name: string, artist: string): Promise<'None' | Record<string, string>> {
		let lyrics = await this.getLyricsFromWiki(name, artist);
		if (lyrics === 'None') return 'None';
		if (!lyrics) {
			lyrics = await this.getLyricsFromGenius(name, artist);
		}
		if (!lyrics) {
			return 'None';
		}
		// 翻译
		if (!Object.keys(lyrics).some(it => it.toLowerCase().includes('mandarin'))) {
			const base = Object.values(lyrics)[0];
			lyrics['中文（DeepL 翻译）'] = await this.translate(base);
		}
		return lyrics;
	}

	async getLyricsFromGenius(name: string, artist: string): Promise<Record<string, string>> {
		console.log('从 Genius 获取歌词');
		let searches = await this.geniusClient.songs.search(`${name}`);
		console.log(searches.map(it => it.title));
		searches = searches.filter(it => !it.title.toLowerCase().includes('translat')); // ion / ed
		if (!searches.length) return;
		const song = searches[0];
		const lyrics = await song.lyrics();
		if (!lyrics) return;
		const langCode = franc(lyrics);
		const lang = iso6393.find(it => it.iso6393 === langCode)?.name;
		return { [lang || '']: lyrics };
	}

	// 返回 undefined = NotFound，返回 None = 纯音乐没有歌词
	async getLyricsFromWiki(name: string, artist: string): Promise<Record<string, string> | undefined | 'None'> {
		console.log('从 Wiki 获取歌词');
		const search = await this.wiki.get({
			action: 'query',
			list: 'search',
			srsearch: `${name}`
		});
		const match = search.data?.query?.search?.[0];
		if (!match) {
			console.log('No match');
			return;
		}

		const page = await this.wiki.get({
			action: 'parse',
			pageid: match.pageid,
			prop: 'wikitext'
		});
		const wikiText = page.data?.parse?.wikitext;
		if (!wikiText) {
			console.log('No wikiText');
			return;
		}

		const data = this.parseLyricsFromWikitext(wikiText);
		console.log(data);
		// 过滤掉无歌词的情况
		if (Object.keys(data).length === 1 && data[''] && data[''].length < 10 && data[''].startsWith('None'))
			return 'None';
		if (Object.keys(data).length === 1 && data[''] && data[''].length < 20 && data[''].includes('Need lyrics'))
			return;
		return data;
	}

	parseLyricsFromWikitext(text: string): Record<string, string> | undefined {
		const lines = text.split(/\n/);
		const lyrics = {} as Record<string, string>;

		let isRead = false;
		let currentLang = '';
		for (const line of lines) {
			if (line === '== Lyrics ==') {
				isRead = true;
				continue;
			}
			if (!isRead) continue;
			if (line.startsWith('=== ') && line.endsWith(' ===')) {
				currentLang = line.slice(4, -4);
				continue;
			}
			if (line.startsWith('== ')) {
				break;
			}
			if (!lyrics[currentLang] && line) {
				lyrics[currentLang] = '';
			}
			lyrics[currentLang] += line + '\n';
		}
		if (!Object.keys(lyrics).length) return;
		for (const lang of Object.keys(lyrics)) {
			lyrics[lang] = lyrics[lang].trim().replace('<pre>', '').replace('</pre>', '');
		}
		return lyrics;
	}

	async translate(text: string) {
		console.log('请求翻译');
		const req = await fetch('https://deepl-proxy.netlify.app/v2/translate', {
			method: 'POST',
			headers: {
				Authorization: 'DeepL-Auth-Key ' + this.deeplAuthKey,
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify({
				target_lang: 'ZH',
				text: [text]
			})
		});

		const res = await req.json() as any;
		return res.translations[0].text;
	}

	convertToTelegraph(lyrics: Record<string, string>, cover?: string) {
		const nodes = [] as tph.Node[];
		if (cover) {
			nodes.push({
				tag: 'img',
				attrs: { src: cover }
			});
		}
		for (const lang of Object.keys(lyrics)) {
			nodes.push({
				tag: 'h3',
				children: [lang]
			});
			for (const line of lyrics[lang].split('\n')) {
				nodes.push({
					tag: 'p',
					children: [line.trim() ? line : { tag: 'br' }]
				});
			}
			nodes.push({
				tag: 'p',
				children: [{ tag: 'br' }]
			});
		}
		return nodes;
	}

	async createTelegraphPage(lyrics: Record<string, string>, title: string, cover?: string) {
		console.log('上传 Telegraph');
		const content = this.convertToTelegraph(lyrics, cover);
		const page = await this.telegraph.createPage(title, content, 'AquaDX Bot', 'https://t.me/AquaDXBot');
		return page.url;
	}
}
