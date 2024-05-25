import { Telegraf } from 'telegraf';
import BotContext from './models/BotContext';
import { BA_VE, FC, LEVEL, LEVEL_EMOJI, LEVEL_EN, LEVELS, PLATE_TYPE, PLATE_VER } from './consts';
import compute from './compute';
import Song from './models/Song';
import Renderer from './render';
import { Env } from '../worker-configuration';
import { useNewReplies } from 'telegraf/future';
import { TypeEnum } from '@gekichumai/dxdata';
import { InlineKeyboardButton } from 'telegraf/types';
import genSongInfoButtons from './utils/genSongInfoButtons';

export const createBot = (env: Env) => {
	const bot = new Telegraf(env.BOT_TOKEN, { contextType: BotContext });
	bot.context.env = env;
	bot.use(useNewReplies());

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
				reply_parameters: { message_id: foundMessage.message_id },
				reply_markup: { inline_keyboard: genSongInfoButtons(song) }
			});
		}
	});

	bot.action(/^song:(\d+):(\d)$/, async (ctx) => {
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		const chart = song.getChart(Number(ctx.match[2]));
		if (!chart) return;

		if (chart.display.length <= 200) {
			await ctx.answerCbQuery(chart.display, { show_alert: true, cache_time: 3600 });
			return;
		}
		await ctx.answerCbQuery();

		const buttons = genSongInfoButtons(song);
		buttons.push([{ text: '🔙 返回', callback_data: `song:${song.dxId}` }]);
		await ctx.editMessageCaption(song.basicInfo + '\n\n' + chart.display, {
			reply_markup: { inline_keyboard: buttons }
		});
	});

	bot.action(/^song:(\d+)$/, async (ctx) => {
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		await ctx.editMessageCaption(song.display, {
			reply_markup: { inline_keyboard: genSongInfoButtons(song) }
		});
	});

	bot.action(/^song:(\d+):alias$/, async (ctx) => {
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		const message = '歌曲别名:\n' + song.searchAcronyms.join(', ');
		if (message.length <= 200) {
			await ctx.answerCbQuery(message, { show_alert: true, cache_time: 3600 });
			return;
		}

		const buttons = genSongInfoButtons(song);
		buttons.push([{ text: '🔙 返回', callback_data: `song:${song.dxId}` }]);
		await ctx.editMessageCaption(song.basicInfo + '\n\n' + message, {
			reply_markup: { inline_keyboard: buttons }
		});
	});

	bot.inlineQuery(/^$/, async (ctx) => {
		await ctx.answerInlineQuery([]);
	});

	bot.inlineQuery(/.+/, async (ctx) => {
		if (ctx.inlineQuery.query.trim() === '') {
			await ctx.answerInlineQuery([]);
		}
		const results = Song.search(ctx.inlineQuery.query.trim().toLowerCase());
		await ctx.answerInlineQuery(results.map(song => ({
			type: 'photo',
			title: song.title,
			description: song.title,
			id: song.dxId?.toString() || song.title,
			photo_url: song.coverUrl,
			thumbnail_url: song.coverUrl,
			caption: song.display,
			reply_markup: { inline_keyboard: genSongInfoButtons(song) }
		})));
	});

	for (const version of PLATE_VER) {
		for (const type of PLATE_TYPE) {
			bot.hears(RegExp(`^\\/?${version} ?${type} ?进度$`), async (ctx) => {
				await ctx.reply(compute.calcProgressText(await ctx.getUserMusic(), version, type));
			});
		}
	}
	bot.hears(['/', ''].map(it => it + '霸者进度'), async (ctx) => {
		await ctx.reply(compute.calcProgressText(await ctx.getUserMusic(), BA_VE));
	});

	for (const version of PLATE_VER) {
		for (const type of PLATE_TYPE) {
			bot.hears(RegExp(`^\\/?${version} ?${type} ?完成[图表]$`), async (ctx) => {
				const genMsg = ctx.reply('图片生成中...');
				await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderPlateProgress(await ctx.getUserMusic(), version, type), filename: `${version}${type}完成表.png` });
				await ctx.deleteMessage((await genMsg).message_id);
			});
		}
	}
	bot.hears(/^\/?霸者完成[图表]$/, async (ctx) => {
		const genMsg = ctx.reply('图片生成中...');
		await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderPlateProgress(await ctx.getUserMusic(), BA_VE), filename: '霸者完成表.png' });
		await ctx.deleteMessage((await genMsg).message_id);
	});

	for (const level of LEVELS) {
		bot.hears(RegExp(`^\\/?${level.replace('+', '\\+')} ?完成[图表]$`), async (ctx) => {
			const genMsg = ctx.reply('图片生成中...');
			await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderLevelProgress(await ctx.getUserMusic(), level), filename: `LV ${level} 完成表.png` });
			await ctx.deleteMessage((await genMsg).message_id);
		});
	}

	bot.command('b50', async (ctx) => {
		const genMsg = ctx.reply('图片生成中...');

		const userMusic = await ctx.getUserMusic();
		const rating = await ctx.getUserRating();
		const userPreview = await ctx.getUserPreview();

		let avatar = await ctx.telegram.getUserProfilePhotos(ctx.from.id, 0, 1).then(it => it.photos[0]?.[0].file_id);
		if (avatar) {
			avatar = (await ctx.telegram.getFileLink(avatar)).toString();
		} else {
			avatar = 'https://nyac.at/api/telegram/avatar/' + ctx.from.id;
			const res = await fetch(avatar, { method: 'HEAD' });
			if (!res.ok) avatar = '';
		}

		await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderB50(rating, userMusic, userPreview.userName, avatar), filename: 'B50.png' });
		await ctx.deleteMessage((await genMsg).message_id);
	});

	bot.command('query', async (ctx) => {
		const results = Song.search(ctx.payload.trim().toLowerCase());

		if (!results.length) {
			await ctx.reply('找不到匹配的歌');
			return;
		}
		for (const song of results) {
			const userScores = (await ctx.getUserMusic()).filter(it => it.musicId === song.id || it.musicId === song.id + 1e4);
			if (!userScores.length) continue;

			const message = [song.title, ''];
			for (const userScore of userScores) {
				const chart = song.getChart(userScore.level, userScore.musicId > 1e4);
				message.push(`${userScore.musicId > 1e4 ? 'DX' : 'STD'} ${LEVEL_EMOJI[userScore.level]} ${chart.internalLevelValue.toFixed(1)} ` +
					`${(userScore.achievement / 1e4).toFixed(4)}% ${FC[userScore.comboStatus]}`);
			}

			await ctx.replyWithPhoto(song.coverUrl, {
				caption: message.join('\n')
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
		if (['message is not modified', 'User not bound'].some(it => err?.message?.includes?.(it))) return;
		ctx.reply && await ctx.reply('发生错误：' + err.message);
	});

	return bot;
};
