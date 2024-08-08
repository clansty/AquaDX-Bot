import BotContext from './BotContext';
import { Env } from '../types';
import genSongInfoButtons from '../utils/genSongInfoButtons';
import { Song } from '@clansty/maibot-types/src';
import { Bot } from 'grammy';

export default (bot: Bot<BotContext>, env: Env) => {
	bot.callbackQuery(/^song:(\d+):(\d)$/, async (ctx) => {
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
		const song = Song.fromId(Number(ctx.match[1]));
		if (!song) return;

		await ctx.editMessageCaption({
			caption: song.display,
			reply_markup: { inline_keyboard: genSongInfoButtons(song) }
		});
	});

	bot.callbackQuery(/^song:(\d+):alias$/, async (ctx) => {
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
