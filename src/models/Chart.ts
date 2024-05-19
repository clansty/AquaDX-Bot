import { DifficultyEnum, NoteCounts, Regions, Sheet, TypeEnum, VersionEnum } from '@gekichumai/dxdata';
import { ALL_MUSIC, LEVEL_EN, LEVELS } from '../consts';

export default class Chart implements Sheet {
	internalId?: number;
	type: TypeEnum;
	releaseDate?: string;
	difficulty: DifficultyEnum;
	internalLevelValue: number;
	multiverInternalLevelValue?: Record<VersionEnum, number>;
	noteDesigner: string;
	noteCounts: NoteCounts;
	regions: Regions;
	isSpecial: boolean;
	version: VersionEnum;
	comment?: string;

	public constructor(data: Sheet, dataFromAllMusic?: typeof ALL_MUSIC[number], internalId?: number) {
		const dataCopy = { ...data };
		delete dataCopy.level;
		Object.assign(this, dataCopy);
		const valueFromAllMusic = dataFromAllMusic?.notes[LEVEL_EN.indexOf(data.difficulty)]?.lv;
		if (valueFromAllMusic && this.internalLevelValue !== valueFromAllMusic) {
			console.log('发现了定数错误', dataFromAllMusic.name, data.type, data.difficulty, '来自 DXRating.net 的定数:', data.internalLevelValue, '来自 all-music.json 的定数:', valueFromAllMusic);
			this.internalLevelValue = valueFromAllMusic;
		}
		if (internalId && !this.internalId) {
			this.internalId = internalId;
		}
	}

	get level(): typeof LEVELS[number] {
		const base = Math.floor(this.internalLevelValue);
		const decimal = this.internalLevelValue * 10 - base * 10;
		if (decimal >= 7) {
			return `${base}+` as typeof LEVELS[number];
		}
		return base.toString() as typeof LEVELS[number];
	}
}
