import { UserMusic } from './types';
import allMusic from './all-music.json';
import { FC, LEVEL } from './consts';

export default {
	getAllMusicScore(musicList: UserMusic[]) {
		const result = [];
		for (const userMusic of musicList) {
			const musicData = allMusic[userMusic.musicId];
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
	}
};
