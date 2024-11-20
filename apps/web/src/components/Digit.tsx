import { ASSET_TYPE, getAssetUrl } from '@clansty/maibot-utils/src/getAssetUrl';
import { component$ } from '@builder.io/qwik';

const IMG_BLUE = getAssetUrl(ASSET_TYPE.Base, 'UI_Num_Score_1110000_Blue');
const IMG_GOLD = getAssetUrl(ASSET_TYPE.Base, 'UI_Num_Score_1110000_Gold');
const IMG_Red = getAssetUrl(ASSET_TYPE.Base, 'UI_Num_Score_1110000_Red');

const IMG_PERCENT_BLUE = getAssetUrl(ASSET_TYPE.Base, 'UI_RSL_Score_Per_Blue');
const IMG_PERCENT_GOLD = getAssetUrl(ASSET_TYPE.Base, 'UI_RSL_Score_Per_Gold');
const IMG_PERCENT_RED = getAssetUrl(ASSET_TYPE.Base, 'UI_RSL_Score_Per_Red');

const IMG_H = 472;
const IMG_W = 344;

const Percent = component$(({ color, width }: { color: 'blue' | 'gold' | 'red', width: number }) => {
	const css = {
		width: width,
		height: width,
		backgroundSize: '120%',
		backgroundPosition: 'center'
	};

	switch (color) {
		case 'blue':
			return <div style={{ ...css, backgroundImage: `url(${IMG_PERCENT_BLUE})` }} />;
		case 'gold':
			return <div style={{ ...css, backgroundImage: `url(${IMG_PERCENT_GOLD})` }} />;
		case 'red':
			return <div style={{ ...css, backgroundImage: `url(${IMG_PERCENT_RED})` }} />;
	}
});

export default component$(({ color, digit, width }: { color: 'blue' | 'gold' | 'red', digit: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '+' | '-' | ',' | '.' | '%', width: number }) => {
	if (digit === '%') return <Percent color={color} width={width} />;

	let position: string;
	switch (digit) {
		case '0':
			position = '0 0';
			break;
		case '1':
			position = '-100% 0';
			break;
		case '2':
			position = '-200% 0';
			break;
		case '3':
			position = '-300% 0';
			break;
		case '4':
			position = '0 -100%';
			break;
		case '5':
			position = '-100% -100%';
			break;
		case '6':
			position = '-200% -100%';
			break;
		case '7':
			position = '-300% -100%';
			break;
		case '8':
			position = '0 -200%';
			break;
		case '9':
			position = '-100% -200%';
			break;
		case '+':
			position = '-200% -200%';
			break;
		case '-':
			position = '-300% -200%';
			break;
		case ',':
			position = '0 -300%';
			break;
		case '.':
			position = '-100% -300%';
			break;
	}

	const height = width * IMG_H / IMG_W;
	const css: any = {
		width,
		height,
		backgroundSize: '400%',
		backgroundPosition: position,
		margin: `0 -${width * .05}px`
	};

	if (digit === '.') {
		css.transform = 'translateY(13%)';
		css.margin = `0 -${width * .23}px`;
	}

	switch (color) {
		case 'blue':
			return <div style={{ ...css, backgroundImage: `url(${IMG_BLUE})` }} />;
		case 'gold':
			return <div style={{ ...css, backgroundImage: `url(${IMG_GOLD})` }} />;
		case 'red':
			return <div style={{ ...css, backgroundImage: `url(${IMG_Red})` }} />;
	}
});
