import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import { INLINE_HELP } from '@clansty/maibot-types/src';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.inlineQuery(/^$/, async (ctx) => {
		// @ts-ignore ???
		await ctx.answerInlineQuery(INLINE_HELP.map((text, seq) => ({
			type: 'article',
			id: seq,
			title: text,
			input_message_content: { message_text: '喵' }
		})));
	});
}
