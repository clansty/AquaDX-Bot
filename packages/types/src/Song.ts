import { CategoryEnum, DifficultyEnum, dxdata, Regions, Song as DataSong, TypeEnum } from '@gekichumai/dxdata';
import Chart from './Chart';
import _ from 'lodash';
import { ALL_MUSIC, TG_MUSIC_IDS } from '@clansty/maibot-data';
import { LEVEL, LEVEL_EN } from './consts';

export default class Song implements DataSong {
	songId: never;
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

	private constructor(data: DataSong, public dx?: boolean, public unlisted = false) {
		Object.assign(this, data);

		const stdChart = data.sheets.find(it => it.type === TypeEnum.STD);
		const dxChart = data.sheets.find(it => it.type === TypeEnum.DX);

		this.id = stdChart ? stdChart.internalId : dxChart?.internalId;

		if (this.id) {
			this.id %= 1e4;
		} else {
			// DXRating.net 中一些歌，比如说 LOSER 和俊达萌起床歌，没有 ID
			const findId = Object.entries(ALL_MUSIC).find(([id, dataFromAllMusic]) => dataFromAllMusic.name?.toLowerCase() === data.title.toLowerCase());
			if (findId) {
				this.id = Number(findId[0]) % 1e4;
				// console.log('修复了 ID 丢失', data.title, this.id);
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

		song = dxdata.songs.find(song => song.title.toLowerCase() === dataFromAllMusic.name.toLowerCase());
		if (song) return new this(song, dx);
		return new this({
			title: dataFromAllMusic.name,
			artist: dataFromAllMusic.composer,
			bpm: undefined,
			category: dataFromAllMusic.genre as unknown as CategoryEnum,
			imageName: undefined,
			isNew: false,
			isLocked: false,
			searchAcronyms: [],
			songId: undefined,
			sheets: dataFromAllMusic.notes.filter(it => it.lv).map((chart, index) => new Chart({
				difficulty: LEVEL_EN[index],
				internalId: dx ? id + 1e4 : id,
				type: dx ? TypeEnum.DX : TypeEnum.STD,
				level: undefined,
				regions: { cn: false, intl: false, jp: false },
				version: undefined,
				noteCounts: undefined,
				noteDesigner: '',
				internalLevelValue: chart.lv,
				isSpecial: undefined
			}, dataFromAllMusic, dx ? id + 1e4 : id))
		}, dx, true);
	}

	public static search(kw: string) {
		const results = [] as Song[];
		if (Number(kw)) {
			const song = this.fromId(Number(kw));
			results.push(song);
		}
		for (const songRaw of dxdata.songs) {
			if (songRaw.title.toLowerCase().includes(kw)) {
				results.push(new this(songRaw));
			} else if (songRaw.searchAcronyms.some(alias => alias === kw)) {
				results.push(new this(songRaw));
			}
		}
		for (const [id, data] of Object.entries(ALL_MUSIC)) {
			if (data.name?.toLowerCase().includes(kw)) {
				results.push(this.fromId(Number(id)));
			}
		}
		return _.uniqBy(results, 'id');
	}

	public static getByCondition(condition: (song: DataSong) => boolean) {
		return dxdata.songs.filter(condition).map(songRaw => new this(songRaw));
	}

	public static getAllIds = () => Object.keys(ALL_MUSIC).map(Number).map(it => it % 1e4);

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
