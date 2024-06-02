import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';
import Renderer from '../classes/Renderer';
import { BA_VE, PLATE_TYPE, PLATE_VER } from '@clansty/maibot-types';
import { calcProgressText } from '@clansty/maibot-utils';
import { InlineQueryResult } from 'telegraf/types';
import { xxhash32 } from 'cf-workers-hash';

export default (bot: Telegraf<BotContext>, env: Env) => {
	const sendProgressImage = async (ctx: BotContext, ver: typeof PLATE_VER[number] | typeof BA_VE, type?: typeof PLATE_TYPE[number] | '') => {
		const userMusic = await ctx.getUserMusic();
		return await ctx.genCacheSendImage([ver, type, userMusic], () => new Renderer(env.MYBROWSER).renderPlateProgress(userMusic, ver, type), `${ver}${type || ''}完成表.png`);
	};

	for (const version of [...PLATE_VER, BA_VE] as const) {
		for (const type of version === BA_VE ? [''] as const : PLATE_TYPE) {
			bot.inlineQuery(RegExp(`^ ?\\/?${version} ?${type} ?(进度)?$`), async (ctx) => {
				const userMusic = await ctx.getUserMusic();
				if (!userMusic?.length) {
					await ctx.answerInlineQuery([], {
						button: { text: '请绑定用户', start_parameter: 'bind' },
						is_personal: true
					});
					return;
				}

				const text = calcProgressText(userMusic, version, type);
				const cachedImage = await ctx.getCacheImage([version, type, userMusic]);
				const results: InlineQueryResult[] = [{
					type: 'article',
					id: '0',
					title: `${version}${type}进度`,
					description: '牌子进度 ' + text.split('\n').pop(),
					input_message_content: { message_text: `${version}${type}进度\n\n` + text }
				}];
				let button = undefined;
				if (cachedImage?.type === 'image') results.push({
					type: 'photo',
					id: 'pic',
					photo_file_id: cachedImage.fileId
				});
				else
					button = { text: `生成图表`, start_parameter: await xxhash32(`${version}${type}`) };
				await ctx.answerInlineQuery(results, { is_personal: true, button, cache_time: 10 });
			});
			bot.start(async (ctx, next) => {
				if (ctx.payload !== await xxhash32(`${version}${type}`)) return next();
				const image = await sendProgressImage(ctx, version, type);
				if ('document' in image && image.document) await ctx.reply('由于图片高度太高，暂时不支持使用行内模式发送');
			});

			bot.hears(RegExp(`^\\/?${version} ?${type} ?进度$`), async (ctx) => {
				await ctx.reply(calcProgressText(await ctx.getUserMusic(), version, type));
			});

			bot.hears(RegExp(`^\\/?${version} ?${type} ?完成[图表]$`), async (ctx) => {
				await sendProgressImage(ctx, version, type);
			});
		}
	}
}
