import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../types';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.command('snapshot', async (ctx) => {
		if (!ctx.payload) {
			await ctx.reply('请输入一个 URL');
			return;
		}

		await env.RENDER_QUEUE.send({
			hash: '',
			filename: 'snapshot.png',
			isFromStart: false,
			chatId: ctx.chat.id,
			replyToMessageId: ctx.msgId,
			queueTime: new Date().getTime(),
			inlineKeyboard: [],
			url: ctx.payload,
			width: 2000
		});
		await ctx.reply('已提交');
	});
}
