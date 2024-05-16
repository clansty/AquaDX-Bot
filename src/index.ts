/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Telegraf } from 'telegraf';
import AquaApi from './api';
import compute from './compute';
import { BA_VE, PLATE_TYPE, PLATE_VER } from './consts';
import BotContext from './BotContext';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.API_SECRET) {
			console.log('Secret-Token 错误');
			return new Response();
		}
		try {
			const bot = new Telegraf(env.BOT_TOKEN, { contextType: BotContext });

			bot.start(Telegraf.reply('Hello'));
			bot.command('bind', async (ctx) => {
				if (ctx.args.length < 1) {
					await ctx.reply('请输入要绑定的 ID');
					return;
				}

				await env.KV.put(`bind:${ctx.from.id}`, ctx.args[0]);
				await ctx.reply(`绑定 ID ${ctx.args[0]} 成功`);
			});

			bot.use(async (ctx, next) => {
				ctx.aquaUserId = Number(await env.KV.get(`bind:${ctx.from.id}`));
				if (!ctx.aquaUserId) {
					await ctx.reply('请先绑定用户');
					return;
				}
				ctx.aqua = await AquaApi.create(env.KV, env.API_BASE, env.POWERON_TOKEN);
				ctx.userMusic = await ctx.aqua.getUserMusic(ctx.aquaUserId);
				await next();
			});

			// 以下的方法会验证绑定，建立 AquaApi 实例和获取 UserMusic
			for (const version of PLATE_VER) {
				for (const type of PLATE_TYPE) {
					bot.hears(['/', ''].map(it => it + version + type + '进度'), async (ctx) => {
						await ctx.reply(compute.calcProgress(ctx.userMusic, version, type));
					});
				}
			}
			bot.hears(['/', ''].map(it => it + '霸者进度'), async (ctx) => {
				await ctx.reply(compute.calcProgress(ctx.userMusic, BA_VE));
			});

			bot.catch(async (err: any, ctx) => {
				console.log(err);
				await ctx.reply('发生错误：' + err.message);
			});


			const req = await request.json();
			console.log(req);
			await bot.handleUpdate(req as any);
		} catch (e) {
			console.log(e);
		}
		return new Response();
	}
};
