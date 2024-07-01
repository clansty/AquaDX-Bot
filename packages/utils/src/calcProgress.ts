import { BA_VE, LEVEL, MAIMAI_DX_RELEASE_DATE, PLATE_TYPE, PLATE_VER, ProgressCalcResult, Song, UserMusic } from '@clansty/maibot-types';

const checkPlateMusic = (music: UserMusic, type: typeof PLATE_TYPE[number] | '') => {
	switch (type) {
		case undefined: // 霸者
		case '':
		case 'clear':
			return music.achievement >= 8e5;
		case '将':
			return music.achievement >= 1e6;
		case '极':
		case 'fc':
			return music.comboStatus > 0;
		case '神':
		case 'ap':
			return music.comboStatus > 2; // AP / AP+
		case '舞舞':
			throw new Error('FDX 我也不知道是多少');
		// return music.syncStatus > 2;
	}
};

export const calcProgress = (musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '', requiredSongList: number[]): ProgressCalcResult[] => {
	const result = [] as ProgressCalcResult[];
	let total = 0, totalDone = 0, maxLevel = 4;
	// 只有舞x 和霸者需要打白谱
	if ([BA_VE, '舞', '全曲'].includes(ver) || ['clear', 'fc', 'ap'].includes(type)) maxLevel = 5;
	for (let lv = 0; lv < maxLevel; lv++) {
		let all = 0, done = 0;
		for (const required of requiredSongList) {
			const chart = Song.fromId(required).getChart(lv);
			if (!chart) continue;
			// 屏蔽追加谱面
			if (type !== 'clear' && (ver === BA_VE || PLATE_VER.indexOf(ver) < PLATE_VER.indexOf('熊'))) {
				if (chart.releaseDate && new Date(chart.releaseDate) >= MAIMAI_DX_RELEASE_DATE) continue;
			}
			all++;
			let userScore = musicList.find(it => it.musicId === required && it.level === lv);
			if (!userScore) continue;
			if (checkPlateMusic(userScore, type)) done++;
		}

		total += all;
		totalDone += done;
		result.push({ done, all });
	}
	return result;
};

export const calcProgressText = (musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '', requiredSongList: number[]): string => {
	const result = calcProgress(musicList, ver, type, requiredSongList);
	const ret = result.map(({ done, all }, lv) => `${LEVEL[lv]} ${done}/${all}`);
	ret.push(`总计 ${result.reduce((acc, { done }) => acc + done, 0)}/${result.reduce((acc, { all }) => acc + all, 0)}`);
	return ret.join('\n');
};
