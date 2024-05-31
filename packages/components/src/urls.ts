import { Rank } from '@clansty/maibot-types';

export const getRankImage = (rank: Rank): string => {
	return `https://shama.dxrating.net/images/rank/buddies-plus/${rank}.png`;
};

export const getDxRatingPlateImage = (rating: number): string => {
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
};
