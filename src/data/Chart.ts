import { DifficultyEnum, NoteCounts, Regions, Sheet, Song as DataSong, TypeEnum, VersionEnum } from '@gekichumai/dxdata';
import { LEVELS } from '../consts';

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

	public constructor(data: Sheet) {
		const dataCopy = { ...data };
		delete dataCopy.level;
		Object.assign(this, dataCopy);
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
