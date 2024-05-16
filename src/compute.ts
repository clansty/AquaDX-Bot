import { UserMusic } from './types';
import { FC, LEVEL, ALL_MUSIC, PLATE_VER, PLATE_TYPE, BA_VE, PLATE_VER_LIST, VER_MUSIC_LIST } from './consts';

export default {
	getAllMusicScore(musicList: UserMusic[]) {
		const result = [];
		for (const userMusic of musicList) {
			const musicData = ALL_MUSIC[userMusic.musicId];
			if (!musicData) {
				result.push('未知歌曲');
				continue;
			}
			try {
				result.push(`${musicData.name} ${LEVEL[userMusic.level]} ${musicData.notes[userMusic.level].lv} ${userMusic.achievement / 10000} ${FC[userMusic.comboStatus]}`);
			} catch (e) {
				result.push('出错');
				console.log('歌曲解析出错', userMusic, musicData);
			}
		}
		return result.join('\n');
	},
	calcProgress(musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number]): string {
		const requiredSongList: number[] = PLATE_VER_LIST[ver].flatMap(ver => VER_MUSIC_LIST[ver]);
		const result = [] as string[];
		for (let lv = 0; lv < 5; lv++) {
			let all = 0;
			let done = 0;
			for (const required of requiredSongList) {
				if (!ALL_MUSIC[required].notes[lv]) continue;
				all++;
				let userScore = musicList.find(it => it.musicId === required && it.level === lv);
				if (!userScore) continue;
				if (userScore.achievement >= 8e5) done++;
			}

			result.push(`${LEVEL[lv]} ${done}/${all}`);
		}
		return result.join('\n');
	}
};
