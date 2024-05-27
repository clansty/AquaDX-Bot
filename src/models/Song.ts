import { CategoryEnum, DifficultyEnum, dxdata, Regions, Song as DataSong, TypeEnum } from '@gekichumai/dxdata';
import { ALL_MUSIC, LEVEL, LEVEL_EMOJI, LEVEL_EN, TG_MUSIC_IDS } from '../consts';
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

	// 一定是 1e4 以内的数
	public readonly id: number;

	private constructor(data: DataSong, public dx?: boolean) {
		Object.assign(this, data);

		const stdChart = data.sheets.find(it => it.type === TypeEnum.STD);
		const dxChart = data.sheets.find(it => it.type === TypeEnum.DX);

		this.id = stdChart ? stdChart.internalId : dxChart?.internalId;

		if (this.id) {
			this.id %= 1e4;
		} else {
			// DXRating.net 中一些歌，比如说 LOSER 和俊达萌起床歌，没有 ID
			const findId = Object.entries(ALL_MUSIC).find(([id, dataFromAllMusic]) => dataFromAllMusic.name === data.title);
			if (findId) {
				this.id = Number(findId[0]) % 1e4;
				console.log('修复了 ID 丢失', data.title, this.id);
			} else {
				console.log('修复不了 ID 丢失', data.title);
			}
		}

		const stdDataFromAllMusic = ALL_MUSIC[this.id];
		const dxDataFromAllMusic = ALL_MUSIC[this.id + 1e4];

		this.sheets = data.sheets.map(sheet => new Chart(sheet,
			// 缓解 DXRating.net 定数错误
			sheet.type === TypeEnum.DX ? dxDataFromAllMusic : stdDataFromAllMusic,
			this.id && (sheet.type === TypeEnum.DX ? this.id + 1e4 : this.id)));
	}

	public get dxId() {
		if (this.dx) return this.id + 1e4;
		if (this.dx === undefined && !this.sheets.find(it => it.type === TypeEnum.STD)) return this.id + 1e4;
		return this.id;
	}

	public get coverUrl() {
		return 'https://shama.dxrating.net/images/cover/v2/' + this.imageName;
	}

	public get tgMusicId() {
		return TG_MUSIC_IDS[this.id];
	}

	public get basicInfo() {
		let message = this.title + '\n\n' +
			`作曲:\t${this.artist}\n` +
			`BPM:\t${this.bpm}\n` +
			`分类:\t${this.category}`;

		if (this.id) {
			message = this.id + '. ' + message;
		}

		return message;
	}

	public get display() {
		let message = this.basicInfo;

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

		if (std) {
			message += `\n\n标准谱面\n添加版本:\t${std.version}\n${regionDisplay(std.regions)}`;
		}
		for (const chart of this.sheets.filter(it => it.type === TypeEnum.STD)) {
			message += '\n' + chart.displayInline;
		}
		if (dx) {
			message += `\n\nDX 谱面\n添加版本:\t${dx.version}\n${regionDisplay(dx.regions)}`;
		}
		for (const chart of this.sheets.filter(it => it.type === TypeEnum.DX)) {
			message += '\n' + chart.displayInline;
		}
		return message;
	}

	public static fromId(id: number) {
		const dx = id > 1e4;
		id %= 1e4;
		let song = dxdata.songs.find(song => song.sheets.some(sheet => sheet.internalId === id || sheet.internalId === id + 1e4));
		if (song) return new this(song, dx);

		const dataFromAllMusic = ALL_MUSIC[id] || ALL_MUSIC[id + 1e4];
		if (!dataFromAllMusic) return null;

		song = dxdata.songs.find(song => song.title === dataFromAllMusic.name);
		if (song) return new this(song, dx);
		return null;
	}

	public static search(kw: string) {
		const results = [] as Song[];
		for (const songRaw of dxdata.songs) {
			if (songRaw.sheets[0].internalId % 1e4 === Number(kw) % 1e4) {
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
