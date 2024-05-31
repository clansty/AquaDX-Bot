import { Rank } from '@clansty/maibot-types';

export const achievementToRank = (achievement: number): Rank => {
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
};
