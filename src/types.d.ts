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

export type RatingListEntry = {
	'musicId': number,
	'level': number,
	'romVersion': number,
	'achievement': number
}

export type UserRating = {
	rating: number,
	ratingList: RatingListEntry[],
	newRatingList: RatingListEntry[]
}

export type UserPreview = {
	'userId': number,
	'userName': string,
	'isLogin': boolean,
	'lastGameId': string,
	'lastDataVersion': string,
	'lastRomVersion': string,
	'lastLoginDate': string,
	'lastPlayDate': string,
	'playerRating': number,
	'nameplateId': number,
	'iconId': number,
	'trophyId': number,
	'partnerId': number,
	'frameId': number,
	'totalAwake': number,
	'isNetMember': number,
	'dailyBonusDate': number,
	'headPhoneVolume': number,
	'dispRate': number,
	'isInherit': number,
	'banState': number
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
