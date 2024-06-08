import { getDxRatingPlateImage } from '@clansty/maibot-components/src/urls';
import React from 'react';

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
