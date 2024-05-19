import Song from './models/Song';
import { Sheet } from '@gekichumai/dxdata';

export type UserMusic = {
	'musicId': number,
	'level': number,
	'playCount': number,
	'achievement': number,
	'comboStatus': number,
	'syncStatus': number,
	'deluxscoreMax': number,
	'scoreRank': number,
	'extNum1': number
}

export type TableContentRenderData = {
	song: Song,
	chart: Sheet,
	score?: UserMusic
}

export type TableContentRenderRow = {
	// 定数
	levelValue: number | string,
	data: TableContentRenderData[]
}

export type ScoreRenderType = 'rank' | 'score'

export type Rank = 'sssp' | 'sss' | 'ssp' | 'ss' | 'sp' | 's' | 'aaa' | 'aa' | 'a' | 'bbb' | 'bb' | 'b' | 'c' | 'd'

export type ProgressCalcResult = { done: number, all: number }
