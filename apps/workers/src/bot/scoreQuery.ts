import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../types';
import { InlineQueryResult } from 'telegraf/types';
import _ from 'lodash';
import { FC, LEVEL_EMOJI, Song } from '@clansty/maibot-types/src';
import { computeRa } from '@clansty/maibot-utils';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.inlineQuery(/^ ?query (.+)/, async (ctx) => {
		const userMusic = await ctx.getUserMusic(false);
		if (!userMusic?.length) {
			await ctx.answerInlineQuery([], {
				button: { text: '请绑定用户', start_parameter: 'bind' },
				is_personal: true
			});
			return;
		}

		const query = ctx.match[1].trim().toLowerCase();
		if (query === '') {
			await ctx.answerInlineQuery([]);
		}
		const results = Song.search(query);
		const ret = [] as InlineQueryResult[];
		for (const song of results) {
			const userScores = (await ctx.getUserMusic()).filter(it => it.musicId === song.id || it.musicId === song.id + 1e4);
			if (!userScores.length) continue;
			_.sortBy(userScores, it => it.level);

			const message = [song.id + '. ' + song.title, ''];
			for (const userScore of userScores) {
				const chart = song.getChart(userScore.level, userScore.musicId > 1e4);
				message.push(`${userScore.musicId > 1e4 ? 'DX' : 'STD'} ${LEVEL_EMOJI[userScore.level]} ${chart.internalLevelValue.toFixed(1)} ` +
					`${(userScore.achievement / 1e4).toFixed(4)}% = ${computeRa(chart.internalLevelValue, userScore.achievement)} ${FC[userScore.comboStatus]}`);
			}

			ret.push(song.tgMusicId ?
				{
					type: 'audio',
					audio_file_id: song.tgMusicId,
					id: song.dxId?.toString() || song.title,
					caption: message.join('\n'),
					reply_markup: {
						inline_keyboard: [[
							{ text: '歌曲详情', switch_inline_query_current_chat: song.id.toString() }
						]]
					}
				} :
				{
					type: 'photo',
					title: song.title,
					description: song.title,
					id: song.dxId?.toString() || song.title,
					photo_url: song.coverUrl,
					thumbnail_url: song.coverUrl,
					caption: message.join('\n'),
					reply_markup: {
						inline_keyboard: [[
							{ text: '歌曲详情', switch_inline_query_current_chat: song.id.toString() }
						]]
					}
				});
		}

		await ctx.answerInlineQuery(ret, {
			is_personal: true
		});
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
			_.sortBy(userScores, it => it.level);

			const message = [song.id + '. ' + song.title, ''];
			for (const userScore of userScores) {
				const chart = song.getChart(userScore.level, userScore.musicId > 1e4);
				message.push(`${userScore.musicId > 1e4 ? 'DX' : 'STD'} ${LEVEL_EMOJI[userScore.level]} ${chart.internalLevelValue.toFixed(1)} ` +
					`${(userScore.achievement / 1e4).toFixed(4)}% = ${computeRa(chart.internalLevelValue, userScore.achievement)} ${FC[userScore.comboStatus]}`);
			}

			const extra = {
				caption: message.join('\n'),
				reply_markup: {
					inline_keyboard: [[
						{ text: '歌曲详情', switch_inline_query_current_chat: song.id.toString() }
					]]
				}
			};
			if (song.tgMusicId) {
				await ctx.replyWithAudio(song.tgMusicId, extra);
			} else {
				await ctx.replyWithPhoto(song.coverUrl, extra);
			}
			return;
		}
		await ctx.reply(`共找到 ${results.length} 个结果：\n\n` +
			results.map(song => `${song.title} ${song.id ? '' : '(ID 缺失)'}`).join('\n') +
			// 如果有 ID 缺失就不一定没玩过了
			(results.some(it => !it.id) ? '' : '\n\n可惜你都没玩过'));
	});
}
