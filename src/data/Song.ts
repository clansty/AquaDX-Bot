import { CategoryEnum, DifficultyEnum, dxdata, Regions, Sheet, Song as DataSong, TypeEnum } from '@gekichumai/dxdata';
import { LEVEL, LEVEL_EMOJI, LEVEL_EN } from '../consts';
import Chart from './Chart';

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
	sheets: Chart[];

	private constructor(data: DataSong, public dx?: boolean) {
		Object.assign(this, data);
		this.sheets = data.sheets.map(sheet => new Chart(sheet));
	}

	public get id() {
		const std = this.sheets.find(it => it.type === TypeEnum.STD);
		const dx = this.sheets.find(it => it.type === TypeEnum.DX);

		const id = std ? std.internalId : (dx?.internalId - 1e4);

		return id || null;
	}

	public get coverUrl() {
		return 'https://shama.dxrating.net/images/cover/v2/' + this.imageName;
	}

	public get display() {
		let message = this.title + '\n\n' +
			`作曲:\t${this.artist}\n` +
			`BPM:\t${this.bpm}\n` +
			`分类:\t${this.category}`;

		const regionDisplay = (reg: Regions) => {
			let toAdd = '';
			if (reg.cn) toAdd += '🇨🇳';
			if (reg.jp) toAdd += '🇯🇵';
			if (reg.intl) toAdd += '🌍';
			if (toAdd) {
				return `可玩区域:\t${toAdd}`;
			}
			return '🗑 删除曲';
		};

		const std = this.sheets.find(it => it.type === TypeEnum.STD);
		const dx = this.sheets.find(it => it.type === TypeEnum.DX);

		if (this.id) {
			message = this.id + '. ' + message;
		}

		if (std) {
			message += `\n\n标准谱面\n添加版本:\t${std.version}\n${regionDisplay(std.regions)}`;
		}
		for (const chart of this.sheets.filter(it => it.type === TypeEnum.STD)) {
			message += `\n${LEVEL_EMOJI[LEVEL_EN.indexOf(chart.difficulty)]} ${chart.internalLevelValue} ${chart.noteDesigner}`;
		}
		if (dx) {
			message += `\n\nDX 谱面\n添加版本:\t${dx.version}\n${regionDisplay(dx.regions)}`;
		}
		for (const chart of this.sheets.filter(it => it.type === TypeEnum.DX)) {
			message += `\n${LEVEL_EMOJI[LEVEL_EN.indexOf(chart.difficulty)]} ${chart.internalLevelValue} ${chart.noteDesigner}`;
		}
		return message;
	}

	public static fromId(id: number) {
		const song = dxdata.songs.find(song => song.sheets.some(sheet => sheet.internalId === id || sheet.internalId === id + 1e4));
		if (!song) return null;
		return new this(song, id > 1e4);
	}

	public static search(kw: string) {
		const results = [] as Song[];
		for (const songRaw of dxdata.songs) {
			if (songRaw.sheets[0].internalId === Number(kw)) {
				results.push(new this(songRaw));
			} else if (songRaw.title.toLowerCase().includes(kw)) {
				results.push(new this(songRaw));
			} else if (songRaw.searchAcronyms.some(alias => alias === kw)) {
				results.push(new this(songRaw));
			}
		}
		return results;
	}

	public static getByCondition(condition: (song: DataSong) => boolean) {
		return dxdata.songs.filter(condition).map(songRaw => new this(songRaw));
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
