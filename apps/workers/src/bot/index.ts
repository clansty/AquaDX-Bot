import BotContext from './BotContext';
import { Env } from '../types';
import bind from './bind';
import callbackQuery from './callbackQuery';
import help from './help';
import scoreQuery from './scoreQuery';
import plateProgress from './plateProgress';
import levelProgress from './levelProgress';
import musicSearch from './musicSearch';
import b50 from './b50';
import levelConstTable from './levelConstTable';
import NoReportError from '../utils/NoReportError';
import admin from './admin';
import { Bot } from 'grammy';
import { captureException, setUser } from '@sentry/cloudflare';
import { autoQuote } from "@roziscoding/grammy-autoquote";

export const createBot = (env: Env) => {
	const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO), ContextConstructor: BotContext });
	bot.use(autoQuote());
	bot.use(async (ctx, next) => {
		ctx.env = env;
		setUser(ctx.from && {
			id: ctx.from.id,
			username: ctx.from.username
		});
		await next();
	});

	// musicSearch 必须是最后一个，因为它的 inlineQuery 的正则匹配会匹配所有消息
	for (const attachHandlers of [callbackQuery, help, bind, scoreQuery, plateProgress, levelProgress, levelConstTable, b50, musicSearch, admin]) {
		attachHandlers(bot, env);
	}


	bot.catch(async ({ ctx, error }) => {
		ctx.transaction('发生错误');
		console.error('Error caught in bot.catch', error);
		const err = error as any;
		if (err instanceof NoReportError) return;
		captureException(error);
		if (['message is not modified'].some(it => err?.message?.includes?.(it))) return;
		ctx.reply && await ctx.reply('发生错误：' + err.message);
	});

	return bot;
};
