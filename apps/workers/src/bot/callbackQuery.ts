import { Telegraf } from 'telegraf';
import BotContext from '../classes/BotContext';
import { Env } from '../../worker-configuration';
import genSongInfoButtons from '../utils/genSongInfoButtons';
import { Song } from '@clansty/maibot-types/src';

export default (bot: Telegraf<BotContext>, env: Env) => {
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
}
