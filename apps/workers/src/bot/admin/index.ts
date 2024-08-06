import { Telegraf } from 'telegraf';
import BotContext from '../BotContext';
import { Env } from '../../types';
import AdminClient from './client';
import NoReportError from '../../utils/NoReportError';

export default (bot: Telegraf<BotContext>, env: Env) => {
	const client = new AdminClient(env.ADMIN_SECRET);
	const admins = env.ADMIN_UIDS.split(',').map(Number);

	const checkAdminUser = (ctx: BotContext) => {
		if (!admins.includes(ctx.from.id)) {
			throw new NoReportError('没有权限');
		}
	};

	bot.command('ban', async (ctx) => {
		checkAdminUser(ctx);

		const username = ctx.payload;
		await client.rankingBan(username);
		await ctx.reply('成功');
	});
}
