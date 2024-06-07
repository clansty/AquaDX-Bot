import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import wrapBasicReactElement from './wrapBasicReactElement';
import { BA_VE, LEVELS, PLATE_TYPE, PLATE_VER, UserMusic, UserRating } from '@clansty/maibot-types';
import { b50, levelProgress, plateProgress } from '@clansty/maibot-components';

const renderReact = (element: ReactElement, width: number) => {
	return { html:  renderToStaticMarkup(wrapBasicReactElement(element)), width };
};

export default {
	plateProgress(score: UserMusic[], ver: typeof PLATE_VER[number] | typeof BA_VE, type: typeof PLATE_TYPE[number] | '') {
		return renderReact(plateProgress(score, ver, type), 1500);
	},

	levelProgress(level: typeof LEVELS[number], score: UserMusic[] = []) {
		return renderReact(levelProgress(score, level), 1500);
	},

	b50(rating: UserRating, userMusic: UserMusic[], username: string, avatar: string) {
		return renderReact(b50(rating, userMusic, username, avatar), 2000);
	}
};
