import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import AquaApi from './api';
import { BA_VE, PLATE_TYPE, PLATE_VER } from './consts';
import compute from './compute';
import Song from './data/Song';

export const createBot = (env: Env) => {
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

	bot.command(['search', 'maimai'], async (ctx) => {
		const results = Song.search(ctx.payload.trim().toLowerCase());
		const foundMessage = await ctx.reply(`共找到 ${results.length} 个结果：\n\n` + results.map(song => song.title).join('\n'));

		for (const song of results.slice(0, 3)) {
			await ctx.replyWithPhoto(song.coverUrl, {
				caption: song.display,
				reply_parameters: { message_id: foundMessage.message_id }
			});
		}
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
		console.error(err);
		await ctx.reply('发生错误：' + err.message);
	});

	return bot;
};
