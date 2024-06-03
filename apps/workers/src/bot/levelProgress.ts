import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import Renderer from '../classes/Renderer';
import { LEVELS } from '@clansty/maibot-types/src';
import { InlineQueryResult } from 'telegraf/types';

export default (bot: Telegraf<BotContext>, env: Env) => {
	const sendProgressImage = async (ctx: BotContext, level: typeof LEVELS[number]) => {
		const userMusic = await ctx.getUserMusic();

		return await ctx.genCacheSendImage([level, userMusic], () => new Renderer(env.MYBROWSER).renderLevelProgress(level, userMusic), `LV ${level} 完成表.png`,
			ctx.chat?.type === 'private' ? level : undefined);
	};

	for (const level of LEVELS) {
		bot.inlineQuery(RegExp(`^ ?\\/?${level} ?(进度)?(完成表)?$`), async (ctx) => {
			const userMusic = await ctx.getUserMusic();
			if (!userMusic?.length) {
				await ctx.answerInlineQuery([], {
					button: { text: '请绑定用户', start_parameter: 'bind' },
					is_personal: true
				});
				return;
			}

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

		bot.start(async (ctx, next) => {
			if (ctx.payload !== level) return next();
			const image = await sendProgressImage(ctx, level);
			if ('document' in image && image.document) await ctx.reply('由于图片高度太高，暂时不支持使用行内模式发送');
		});

		bot.hears(RegExp(`^\\/?${level.replace('+', '\\+')} ?(进度|完成[图表])$`), async (ctx) => {
			await sendProgressImage(ctx, level);
		});
	}
}
