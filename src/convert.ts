import { Rank } from './types';

export default {
	achievementToRank(achievement: number): Rank {
		if (achievement >= 1005e3) return 'sssp';
		if (achievement >= 1e6) return 'sss';
		if (achievement >= 995e3) return 'ssp';
		if (achievement >= 99e4) return 'ss';
		if (achievement >= 98e4) return 'sp';
		if (achievement >= 97e4) return 's';
		if (achievement >= 94e4) return 'aaa';
		if (achievement >= 90e4) return 'aa';
		if (achievement >= 80e4) return 'a';
		if (achievement >= 75e4) return 'bbb';
		if (achievement >= 70e4) return 'bb';
		if (achievement >= 60e4) return 'b';
		if (achievement >= 50e4) return 'c';
		return 'd';
	},
	getRankImage(rank: Rank): string {
		return `https://shama.dxrating.net/images/rank/buddies-plus/${rank}.png`;
	},
	getDxRatingPlateImage(rating: number): string {
		let id = '';

		const levels = [1000, 2000, 4000, 7000, 10000, 12000, 13000, 14000, 14500, 15000];
		if (rating < levels[0]) id = '01';
		if (rating >= levels[9]) id = '11';
		for (let i = 0; i < 9; i++) {
			if (rating >= levels[i] && rating < levels[i + 1]) {
				id = (i + 2).toString().padStart(2, '0');
				break;
			}
		}

		return `https://cdn.0w.al/UI_CMN_DXRating_${id}.png`;
	}
};
