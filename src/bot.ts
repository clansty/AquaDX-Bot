import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import AquaApi from './api';
import { BA_VE, FC, LEVEL_EMOJI, PLATE_TYPE, PLATE_VER } from './consts';
import compute from './compute';
import Song from './data/Song';

export const createBot = (env: Env) => {
	const bot = new Telegraf(env.BOT_TOKEN, { contextType: BotContext });
	bot.context.env = env;

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

	for (const version of PLATE_VER) {
		for (const type of PLATE_TYPE) {
			bot.hears(['/', ''].map(it => it + version + type + '进度'), async (ctx) => {
				await ctx.useUserMusic();
				await ctx.reply(compute.calcProgress(ctx.userMusic, version, type));
			});
		}
	}
	bot.hears(['/', ''].map(it => it + '霸者进度'), async (ctx) => {
		await ctx.useUserMusic();
		await ctx.reply(compute.calcProgress(ctx.userMusic, BA_VE));
	});

	bot.command('query', async (ctx) => {
		await ctx.useUserMusic();
		const results = Song.search(ctx.payload.trim().toLowerCase());

		if (!results.length) {
			await ctx.reply('找不到匹配的歌');
			return;
		}
		for (const song of results) {
			const userScores = ctx.userMusic.filter(it => it.musicId === song.id || it.musicId === song.id + 1e4);
			if (!userScores.length) continue;

			const message = [song.title, ''];
			for (const userScore of userScores) {
				const chart = song.getChart(userScore.level);
				message.push(`${userScore.musicId > 1e4 ? 'DX' : 'STD'} ${LEVEL_EMOJI[userScore.level]} ${chart.internalLevelValue} ${userScore.achievement / 1e4}% ${FC[userScore.comboStatus]}`);
			}

			await ctx.replyWithPhoto(song.coverUrl, {
				caption: message.join('\n'),
				reply_parameters: { message_id: ctx.message.message_id }
			});
			return;
		}
		await ctx.reply(`共找到 ${results.length} 个结果：\n\n` +
			results.map(song => `${song.title} ${song.id ? '' : '(ID 缺失)'}`).join('\n') +
			// 如果有 ID 缺失就不一定没玩过了
			(results.some(it => !it.id) ? '' : '\n\n可惜你都没玩过'));
	});


	bot.catch(async (err: any, ctx) => {
		console.error(err);
		await ctx.reply('发生错误：' + err.message);
	});

	return bot;
};
