import { Env } from '../types';
import { Bot as GrammyBot, InputFile } from 'grammy';
import { captureException, setUser } from '@sentry/cloudflare';
import { autoQuote } from '@roziscoding/grammy-autoquote';
import { buildBot, NoReportError } from '@clansty/maibot-core';
import { BotAdapter } from '../adapter/Bot';
import fileIdsDev from './fileIds-dev.json';
import fileIdsProd from './fileIds-prod.json';
import { CloudflareKvAdapter } from '@clansty/maibot-types';

const TG_MUSIC_IDS = (process.env.NODE_ENV === 'development' ? fileIdsDev : fileIdsProd) as Record<string | number, string>;

export const createBot = (env: Env) => {
	const bot = new GrammyBot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });
	bot.use(autoQuote());
	bot.use(async (ctx, next) => {
		setUser(ctx.from && {
			id: ctx.from.id,
			username: ctx.from.username
		});
		await next();
	});

	const internalBot = new BotAdapter(bot);
	buildBot({
		bot: internalBot,
		env: {
			...env,
			KV: new CloudflareKvAdapter(env.KV)
		},
		musicToFile: TG_MUSIC_IDS,
		async genImage(url: string, width: number) {
			const id = this.env.RENDERER.idFromName('browser');
			const obj = this.env.RENDERER.get(id);

			let req = await obj.fetch('https://do', {
				method: 'POST',
				body: JSON.stringify({ url, width })
			});

			if (!req.ok) {
				throw new Error(await req.text());
			}

			return {
				height: Number(req.headers.get('height')),
				data: new InputFile(Buffer.from(await req.arrayBuffer()), 'image.png')
			};
		}
	});

	bot.catch(async ({ ctx, error }) => {
		console.error('Error caught in bot.catch', error);
		const err = error as any;
		if (err instanceof NoReportError) return;
		captureException(error);
		if (['message is not modified'].some(it => err?.message?.includes?.(it))) return;
		ctx.reply && await ctx.reply('发生错误：' + err.message);
	});

	return bot;
};
