import { CategoryEnum, DifficultyEnum, dxdata, Regions, Sheet, Song as DataSong, TypeEnum } from '@gekichumai/dxdata';
import { LEVEL, LEVEL_EMOJI, LEVEL_EN } from '../consts';

export default class Song implements DataSong {
	songId: string;
	searchAcronyms: string[];
	category: CategoryEnum;
	title: string;
	artist: string;
	bpm: number;
	imageName: string;
	isNew: boolean;
	isLocked: boolean;
	sheets: Sheet[];

	dx: boolean;

	private constructor() {
	}

	public get coverUrl() {
		return 'https://shama.dxrating.net/images/cover/v2/' + this.imageName;
	}

	public get display() {
		let message = this.title + '\n\n' +
			this.artist + '\n' +
			'BPM ' + this.bpm + '\n' +
			this.category;

		const addRegionDisplay = (reg: Regions) => {
			if (reg.cn) message += '🇨🇳';
			if (reg.jp) message += '🇯🇵';
			if (reg.intl) message += '🌍';
		};

		const std = this.sheets.find(it => it.type === TypeEnum.STD);
		const dx = this.sheets.find(it => it.type === TypeEnum.DX);

		const id = std ? std.internalId : (dx?.internalId - 1e4);
		if (id) {
			message = id + ' ' + message;
		}

		if (std) {
			message += '\n\n标准谱面 ' + std.version + ' ';
			addRegionDisplay(std.regions);
		}
		for (const chart of this.sheets.filter(it => it.type === TypeEnum.STD)) {
			message += `\n${LEVEL_EMOJI[LEVEL_EN.indexOf(chart.difficulty)]} ${chart.internalLevelValue} ${chart.noteDesigner}`;
		}
		if (dx) {
			message += '\n\nDX 谱面 ' + dx.version + ' ';
			addRegionDisplay(dx.regions);
		}
		for (const chart of this.sheets.filter(it => it.type === TypeEnum.DX)) {
			message += `\n${LEVEL_EMOJI[LEVEL_EN.indexOf(chart.difficulty)]} ${chart.internalLevelValue} ${chart.noteDesigner}`;
		}
		return message;
	}

	public static fromId(id: number) {
		const song = dxdata.songs.find(song => song.sheets.some(sheet => sheet.internalId === id || sheet.internalId === id + 1e4));
		if (!song) return null;
		const inst = new this();
		inst.dx = id > 1e4;
		return Object.assign(inst, song);
	}

	public static search(kw: string) {
		const results = [] as Song[];
		for (const songRaw of dxdata.songs) {
			if (songRaw.sheets[0].internalId === Number(kw)) {
				results.push(Object.assign(new this(), songRaw));
			} else if (songRaw.title.toLowerCase().includes(kw)) {
				results.push(Object.assign(new this(), songRaw));
			} else if (songRaw.searchAcronyms.some(alias => alias === kw)) {
				results.push(Object.assign(new this(), songRaw));
			}
		}
		return results;
	}

	public getChart(difficulty: DifficultyEnum | number | typeof LEVEL[number], dx = this.dx) {
		if (LEVEL.includes(difficulty as any)) {
			difficulty = LEVEL.indexOf(difficulty as any);
		}
		if (typeof difficulty === 'number') {
			difficulty = LEVEL_EN[difficulty];
		}
		if (dx === undefined) {
			return this.sheets.find(sheet => sheet.difficulty === difficulty);
		}
		return this.sheets.find(sheet => sheet.type === (dx ? 'dx' : 'std') && sheet.difficulty === difficulty);
	}
}
