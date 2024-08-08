import BotContext from './BotContext';
import { Env } from '../types';
import { INLINE_HELP } from '@clansty/maibot-types';
import { Bot } from 'grammy';

export default (bot: Bot<BotContext>, env: Env) => {
	bot.inlineQuery(/^$/, async (ctx) => {
		await ctx.answerInlineQuery([], {
			button: { text: '行内模式说明', start_parameter: 'help-inline' },
			cache_time: 3600
		});
	});

	bot.command('start', async (ctx, next) => {
		if (ctx.match !== 'help-inline') return next();
		await ctx.replyWithHTML(INLINE_HELP);
	});
}
