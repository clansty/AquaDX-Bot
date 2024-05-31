import { Telegraf } from 'telegraf';
import BotContext from '../classes/BotContext';
import { Env } from '../../worker-configuration';
import Renderer from '../classes/Renderer';
import { LEVELS } from '@clansty/maibot-types/src';

export default (bot: Telegraf<BotContext>, env: Env) => {
	for (const level of LEVELS) {
		bot.hears(RegExp(`^\\/?${level.replace('+', '\\+')} ?完成[图表]$`), async (ctx) => {
			const genMsg = ctx.reply('图片生成中...');
			await ctx.replyWithDocument({ source: await new Renderer(env.MYBROWSER).renderLevelProgress(await ctx.getUserMusic(), level), filename: `LV ${level} 完成表.png` });
			await ctx.deleteMessage((await genMsg).message_id);
		});
	}
}
