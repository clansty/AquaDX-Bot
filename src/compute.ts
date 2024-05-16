import { UserMusic } from './types';
import { LEVEL, PLATE_VER, PLATE_TYPE, BA_VE, PLATE_VER_LIST, VER_MUSIC_LIST, MAIMAI_DX_RELEASE_DATE } from './consts';
import Song from './data/Song';

const checkPlateMusic = (music: UserMusic, type?: typeof PLATE_TYPE[number]) => {
	switch (type) {
		case undefined: // 霸者
			return music.achievement >= 8e5;
		case '将':
			return music.achievement >= 1e6;
		case '极':
			return music.comboStatus > 0;
		case '神':
			return music.comboStatus > 2; // AP / AP+
		case '舞舞':
			throw new Error('FDX 我也不知道是多少');
			return music.syncStatus > 2;
	}
};

export default {
	calcProgress(musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number]): string {
		const requiredSongList: number[] = PLATE_VER_LIST[ver].flatMap(ver => VER_MUSIC_LIST[ver]);
		const result = [] as string[];
		let total = 0, totalDone = 0;
		for (let lv = 0; lv < 5; lv++) {
			let all = 0, done = 0;
			for (const required of requiredSongList) {
				const chart = Song.fromId(required).getChart(lv);
				if (!chart) continue;
				// 屏蔽追加谱面
				if (ver === BA_VE || PLATE_VER.indexOf(ver) < PLATE_VER.indexOf('熊')) {
					if (chart.releaseDate && new Date(chart.releaseDate) >= MAIMAI_DX_RELEASE_DATE) continue;
				}
				all++;
				let userScore = musicList.find(it => it.musicId === required && it.level === lv);
				if (!userScore) continue;
				if (checkPlateMusic(userScore, type)) done++;
			}

			total += all;
			totalDone += done;
			result.push(`${LEVEL[lv]} ${done}/${all}`);
		}
		result.push('', `总计 ${totalDone}/${total}`);
		return result.join('\n');
	}
};
