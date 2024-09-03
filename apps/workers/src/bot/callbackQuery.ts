import BotContext from './BotContext';
import { Env } from '../types';
import genSongInfoButtons from '../utils/genSongInfoButtons';
import { Song } from '@clansty/maibot-types/src';
import { Bot } from 'grammy';

export default (bot: Bot<BotContext>, env: Env) => {
	const genSongInfoButtonsWithCachedLyrics = async (song: Song) => {
		const origin = genSongInfoButtons(song);
		const data = await env.KV.get(`lyrics:${song.id}`);
		if (data && data !== 'None') {
			origin.push([{ text: '查看歌词', url: data }]);
		}
		return origin;
	};

	bot.callbackQuery(/^song:(\d+):(\d)$/, async (ctx) => {
		ctx.transaction('callbackQuery selectChart');
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		const chart = song.getChart(Number(ctx.match[2]));
		if (!chart) return;

		if (chart.display.length <= 200) {
			await ctx.answerCallbackQuery({ show_alert: true, cache_time: 3600, text: chart.display });
			return;
		}
		await ctx.answerCallbackQuery();

		const buttons = genSongInfoButtons(song);
		buttons.push([{ text: '🔙 返回', callback_data: `song:${song.dxId}` }]);
		await ctx.editMessageCaption({
			caption: song.basicInfo + '\n\n' + chart.display,
			reply_markup: { inline_keyboard: buttons }
		});
	});

	bot.callbackQuery(/^song:(\d+)$/, async (ctx) => {
		ctx.transaction('callbackQuery songBack');
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		await ctx.editMessageCaption({
			caption: song.display,
			reply_markup: { inline_keyboard: await genSongInfoButtonsWithCachedLyrics(song) }
		});
	});

	bot.callbackQuery(/^song:(\d+):alias$/, async (ctx) => {
		ctx.transaction('callbackQuery songAlias');
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		const message = '歌曲别名:\n' + song.searchAcronyms.join(', ');
		if (message.length <= 200) {
			await ctx.answerCallbackQuery({ show_alert: true, cache_time: 3600, text: message });
			return;
		}

		const buttons = genSongInfoButtons(song);
		buttons.push([{ text: '🔙 返回', callback_data: `song:${song.dxId}` }]);
		await ctx.editMessageCaption({
			caption: song.basicInfo + '\n\n' + message,
			reply_markup: { inline_keyboard: buttons }
		});
	});
}
