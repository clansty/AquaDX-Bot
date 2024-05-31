import { Telegraf } from 'telegraf';
import BotContext from './BotContext';
import { Env } from '../../worker-configuration';

export default (bot: Telegraf<BotContext>, env: Env) => {
	bot.start(async (ctx, next) => {
		if (ctx.payload !== 'bind') return next();
		await ctx.reply('bind test');
	});

	bot.command('bind', async (ctx) => {
		if (ctx.args.length < 1) {
			await ctx.reply('请输入要绑定的 ID');
			return;
		}

		await env.KV.put(`bind:${ctx.from.id}`, ctx.args[0]);
		await ctx.reply(`绑定 ID ${ctx.args[0]} 成功`);
	});
}
