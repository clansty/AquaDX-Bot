import { CategoryEnum, DifficultyEnum, dxdata, Sheet, Song as DataSong } from '@gekichumai/dxdata';
import { LEVEL, LEVEL_EN } from '../consts';

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

	public static fromId(id: number) {
		const song = dxdata.songs.find(song => song.sheets.some(sheet => sheet.internalId === id || sheet.internalId === id + 1e4));
		if (!song) return null;
		const inst = new this();
		inst.dx = id > 1e4;
		return Object.assign(inst, song);
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
