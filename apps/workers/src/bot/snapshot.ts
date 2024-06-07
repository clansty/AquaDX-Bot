import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import { RENDER_QUEUE_ITEM } from '../types';
import Compressor from 'tiny-compressor';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.command('snapshot', async (ctx) => {
		if (!ctx.payload) {
			await ctx.reply('请输入一个 URL');
			return;
		}

		const message = JSON.stringify({
			hash: '',
			filename: 'snapshot.png',
			isFromStart: false,
			chatId: ctx.chat.id,
			replyToMessageId: ctx.msgId,
			queueTime: new Date().getTime(),
			inlineKeyboard: [],
			url: ctx.payload,
			width: 2000
		} as RENDER_QUEUE_ITEM);

		await env.RENDER_QUEUE.send(await Compressor.compress(Buffer.from(message), 'deflate-raw'), { contentType: 'bytes' });
		await ctx.reply('已提交');
	});
}
