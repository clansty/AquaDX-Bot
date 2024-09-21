import React from 'react';
import { ASSET_TYPE, getAssetUrl } from '@clansty/maibot-utils/src/getAssetUrl';

const getDxRatingPlateImage = (rating: number): string => {
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

	return getAssetUrl(ASSET_TYPE.Base, `UI_CMN_DXRating_${id}`);
};

export default ({ score }: { score: number }) => {
	return <div className="relative inline-block">
		<img src={getDxRatingPlateImage(score)} className="h-1.2em vertical-text-top" />
		<div style={{ gridTemplateColumns: 'repeat(5, 1fr)', fontFamily: 'var(--font-reddit-mono), Reddit Mono' }}
			className="absolute grid top-0 bottom-0 left-47% right-14% text-0.6em font-600 c-#fcd41b">
			{Array.apply(undefined, { length: 5 - score.toString().length }).map(() => <span />)}
			{score.toString().split('').map((digit, index) =>
				<span key={index} className="flex items-center justify-center">{digit}</span>)}
		</div>
	</div>;
};
