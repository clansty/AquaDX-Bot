import { UserMusic } from './types';
import allMusic from './all-music.json';

const LEVEL = ['绿', '黄', '红', '紫', '白'];
const FC = ['', 'FC', 'FC+', 'AP', 'AP+'];

export default {
	getAllMusicScore(musicList: UserMusic[]) {
		const result = [];
		for (const userMusic of musicList) {
			const musicData = allMusic[userMusic.musicId];
			if (!musicData) {
				result.push('未知歌曲');
				continue;
			}
			result.push(`${musicData.name} ${LEVEL[userMusic.level]} ${musicData.notes[userMusic.level].lv} ${userMusic.achievement / 10000} ${FC[userMusic.comboStatus]}`);
		}
		return result.join('\n');
	}
};
