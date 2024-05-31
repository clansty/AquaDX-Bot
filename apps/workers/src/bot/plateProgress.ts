import { Telegraf } from 'telegraf';
import BotContext from '../classes/BotContext';
import { Env } from '../../worker-configuration';
import Renderer from '../classes/Renderer';
import { BA_VE, PLATE_TYPE, PLATE_VER } from '@clansty/maibot-types/src';
import { calcProgressText } from '@clansty/maibot-utils/src';

export default (bot: Telegraf<BotContext>, env: Env) => {
	for (const version of PLATE_VER) {
		for (const type of PLATE_TYPE) {
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
				await ctx.answerInlineQuery([{
					type: 'article',
					id: '0',
					title: `${version}${type}进度`,
					description: '牌子进度 ' + text.split('\n').pop(),
					input_message_content: { message_text: `${version}${type}进度\n\n` + text }
				}], { is_personal: true });
			});
			bot.hears(RegExp(`^\\/?${version} ?${type} ?进度$`), async (ctx) => {
				await ctx.reply(calcProgressText(await ctx.getUserMusic(), version, type));
			});
			bot.hears(RegExp(`^\\/?${version} ?${type} ?完成[图表]$`), async (ctx) => {
				const genMsg = ctx.reply('图片生成中...');
				await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderPlateProgress(await ctx.getUserMusic(), version, type), filename: `${version}${type}完成表.png` });
				await ctx.deleteMessage((await genMsg).message_id);
			});
		}
	}
	bot.inlineQuery(RegExp(`^ ?\\/?霸者 ?(进度)?$`), async (ctx) => {
		const userMusic = await ctx.getUserMusic();
		if (!userMusic?.length) {
			await ctx.answerInlineQuery([], {
				button: { text: '请绑定用户', start_parameter: 'bind' },
				is_personal: true
			});
			return;
		}

		const text = calcProgressText(userMusic, BA_VE);
		await ctx.answerInlineQuery([{
			type: 'article',
			id: '0',
			title: `霸者进度`,
			description: '牌子进度 ' + text.split('\n').pop(),
			input_message_content: { message_text: `霸者进度\n\n` + text }
		}], { is_personal: true });
	});
	bot.hears(['/', ''].map(it => it + '霸者进度'), async (ctx) => {
		await ctx.reply(calcProgressText(await ctx.getUserMusic(), BA_VE));
	});
	bot.hears(/^\/?霸者完成[图表]$/, async (ctx) => {
		const genMsg = ctx.reply('图片生成中...');
		await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderPlateProgress(await ctx.getUserMusic(), BA_VE), filename: '霸者完成表.png' });
		await ctx.deleteMessage((await genMsg).message_id);
	});
}
