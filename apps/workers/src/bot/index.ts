import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import { useNewReplies } from 'telegraf/future';
import bind from './bind';
import callbackQuery from './callbackQuery';
import help from './help';
import scoreQuery from './scoreQuery';
import plateProgress from './plateProgress';
import levelProgress from './levelProgress';
import musicSearch from './musicSearch';
import b50 from './b50';
import levelConstTable from './levelConstTable';

export const createBot = (env: Env) => {
	const bot = new Telegraf(env.BOT_TOKEN, { contextType: BotContext });
	bot.context.env = env;
	bot.use(useNewReplies());

	// musicSearch 必须是最后一个，因为它的 inlineQuery 的正则匹配会匹配所有消息
	for (const attachHandlers of [callbackQuery, help, bind, scoreQuery, plateProgress, levelProgress, levelConstTable, b50, musicSearch]) {
		attachHandlers(bot, env);
	}


	bot.catch(async (err: any, ctx) => {
		console.error(err);
		if (['message is not modified', 'User not bound'].some(it => err?.message?.includes?.(it))) return;
		ctx.reply && await ctx.reply('发生错误：' + err.message);
	});

	return bot;
};
