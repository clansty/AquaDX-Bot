import { ProgressCalcResult, UserMusic } from './types';
import { LEVEL, PLATE_VER, PLATE_TYPE, BA_VE, PLATE_VER_LIST, VER_MUSIC_LIST, MAIMAI_DX_RELEASE_DATE } from './consts';
import Song from './models/Song';

const checkPlateMusic = (music: UserMusic, type?: typeof PLATE_TYPE[number]) => {
	switch (type) {
		case undefined: // 霸者
		case 'clear':
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

const compute = {
	calcProgress(musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number]): ProgressCalcResult[] {
		const requiredSongList: number[] = PLATE_VER_LIST[ver].flatMap(ver => VER_MUSIC_LIST[ver]);
		const result = [] as ProgressCalcResult[];
		let total = 0, totalDone = 0, maxLevel = 4;
		// 只有舞x 和霸者需要打白谱
		if (ver === BA_VE || ver === '舞') maxLevel = 5;
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
	},
	calcProgressText(musicList: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number]): string {
		const result = compute.calcProgress(musicList, ver, type);
		const ret = result.map(({ done, all }, lv) => `${LEVEL[lv]} ${done}/${all}`);
		ret.push(`总计 ${result.reduce((acc, { done }) => acc + done, 0)}/${result.reduce((acc, { all }) => acc + all, 0)}`);
		return ret.join('\n');
	},
	ra(ds: number, achievement: number): number {
		let baseRa: number = 22.4;
		if (achievement < 50e4) {
			baseRa = 0.0;
		} else if (achievement < 60e4) {
			baseRa = 8.0;
		} else if (achievement < 70e4) {
			baseRa = 9.6;
		} else if (achievement < 75e4) {
			baseRa = 11.2;
		} else if (achievement < 80e4) {
			baseRa = 12.0;
		} else if (achievement < 90e4) {
			baseRa = 13.6;
		} else if (achievement < 94e4) {
			baseRa = 15.2;
		} else if (achievement < 97e4) {
			baseRa = 16.8;
		} else if (achievement < 98e4) {
			baseRa = 20.0;
		} else if (achievement < 99e4) {
			baseRa = 20.3;
		} else if (achievement < 995e3) {
			baseRa = 20.8;
		} else if (achievement < 1e6) {
			baseRa = 21.1;
		} else if (achievement < 1005e3) {
			baseRa = 21.6;
		}
		return Math.floor(ds * (Math.min(100.5, achievement / 1e4) / 100) * baseRa);
	},
	ratingAnalyse(rating: number): string {
		const sssp = rating / 22.4 / 1.005;
		const sss = rating / 21.6;
		const ss = rating / 20.8 / 0.99;

		return `${rating} ≈ ${sssp.toFixed(1)} SSS+ / ${sss.toFixed(1)} SSS / ${ss.toFixed(1)} SS`;
	}
};

export default compute;
