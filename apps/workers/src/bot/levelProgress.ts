import BotContext from './BotContext';
import { Env } from '../types';
import { LEVELS, Song } from '@clansty/maibot-types';
import { Bot } from 'grammy';
import type { InlineQueryResult } from 'grammy/types';

export default (bot: Bot<BotContext>, env: Env) => {
	const sendProgressImage = async (ctx: BotContext, level: typeof LEVELS[number], isFromStart = false) => {
		const profile = await ctx.getCurrentProfile();
		const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
		const userMusic = await profile.getUserMusic(requiredSongList);

		return await ctx.genCacheSendImage([level, userMusic], `https://maibot-web.pages.dev/levelProgress/${ctx.from.id}/${ctx.currentProfileId}/${encodeURIComponent(level)}`,
			1500, `LV ${level} 完成表.png`, ctx.chat?.type === 'private' ? level : undefined, isFromStart, [
				[{ text: '查看详情', url: `tg://resolve?domain=${ctx.me.username}&appname=webapp&startapp=${encodeURIComponent(btoa(`/levelProgress/${ctx.from.id}/${ctx.currentProfileId}/${encodeURIComponent(level)}`))}` }]
			]);
	};

	for (const level of LEVELS) {
		bot.inlineQuery(RegExp(`^ ?\\/?${level} ?(进度)?(完成表)?$`), async (ctx) => {
			ctx.transaction('inlineQuery 等级完成表');
			const profile = await ctx.getCurrentProfile();
			if (!profile) {
				await ctx.answerInlineQuery([], {
					button: { text: '请绑定用户', start_parameter: 'bind' },
					is_personal: true
				});
				return;
			}

			const requiredSongList = Song.getByCondition(it => it.sheets.some(chart => chart.level === level));
			const userMusic = await profile.getUserMusic(requiredSongList);
			const cachedImage = await ctx.getCacheImage([level, userMusic]);
			const results: InlineQueryResult[] = [];
			let button = undefined;
			if (cachedImage?.type === 'image') results.push({
				type: 'photo',
				id: 'pic',
				photo_file_id: cachedImage.fileId
			});
			else
				// 不知道为什么，带 + 的等级都显示不出来
				button = { text: `生成 LV ${level} 完成表`, start_parameter: level };
			await ctx.answerInlineQuery(results, { is_personal: true, button, cache_time: 10 });
		});

		bot.command('start', async (ctx, next) => {
			if (ctx.match !== level) return next();
			ctx.transaction('start 等级完成表');
			await sendProgressImage(ctx, level, true);
		});

		bot.hears(RegExp(`^\\/?${level.replace('+', '\\+')} ?(进度|完成[图表])$`), async (ctx) => {
			ctx.transaction('等级完成表');
			await sendProgressImage(ctx, level);
		});
	}
}
