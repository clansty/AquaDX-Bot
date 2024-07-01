import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../types';
import { LEVEL_CONST_TABLES, LEVELS } from '@clansty/maibot-types';
import _ from 'lodash';

export default (bot: Telegraf<BotContext>, env: Env) => {
	for (const level of LEVELS) {
		bot.hears(RegExp(`^\\/?${level.replace('+', '\\+')} ?定数表$`), async (ctx) => {
			await ctx.replyWithPhoto(LEVEL_CONST_TABLES[level]);
		});

		bot.inlineQuery(RegExp(`^ ?\\/?${level} ?定数表$`), async (ctx) => {
			await ctx.answerInlineQuery([{
				type: 'photo',
				title: level,
				description: level,
				id: level,
				photo_file_id: LEVEL_CONST_TABLES[level]
			}], { cache_time: 3600 });
		});
	}

	bot.inlineQuery('定数表', async (ctx) => {
		await ctx.answerInlineQuery(_.sortBy(Object.entries(LEVEL_CONST_TABLES), ([level]) => LEVELS.indexOf(level as any)).map(([level, fileId]) => ({
			type: 'photo',
			title: level,
			description: level,
			id: level,
			photo_file_id: fileId
		})), { cache_time: 3600 });
	});

}
