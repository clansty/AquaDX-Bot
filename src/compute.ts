import { UserMusic } from './types';
import { LEVEL, PLATE_VER, PLATE_TYPE, BA_VE, PLATE_VER_LIST, VER_MUSIC_LIST } from './consts';
import Song from './data/Song';

export default {
	calcProgress(musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number]): string {
		const requiredSongList: number[] = PLATE_VER_LIST[ver].flatMap(ver => VER_MUSIC_LIST[ver]);
		const result = [] as string[];
		let total = 0, totalDone = 0;
		for (let lv = 0; lv < 5; lv++) {
			let all = 0, done = 0;
			for (const required of requiredSongList) {
				if (!Song.fromId(required).getChart(lv)) continue;
				all++;
				let userScore = musicList.find(it => it.musicId === required && it.level === lv);
				if (!userScore) continue;
				if (userScore.achievement >= 8e5) done++;
			}

			total += all;
			totalDone += done;
			result.push(`${LEVEL[lv]} ${done}/${all}`);
		}
		result.push('', `总计 ${totalDone}/${total}`);
		return result.join('\n');
	}
};
