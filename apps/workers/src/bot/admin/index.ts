import BotContext from '../BotContext';
import { Env } from '../../types';
import AdminClient from './client';
import NoReportError from '../../utils/NoReportError';
import { Bot } from 'grammy';
import { commandListAdmin, commandListGroup, commandListPrivate } from '../commandList';

export default (bot: Bot<BotContext>, env: Env) => {
	const client = new AdminClient(env.ADMIN_SECRET);
	const admins = env.ADMIN_UIDS.split(',').map(Number);

	const checkAdminUser = (ctx: BotContext) => {
		ctx.transaction('checkAdminUser');
		if (!admins.includes(ctx.from.id)) {
			throw new NoReportError('没有权限');
		}
	};

	bot.command('ban', async (ctx) => {
		ctx.transaction('ban');
		checkAdminUser(ctx);

		const username = ctx.match;
		await client.rankingBan(username);
		await ctx.reply('成功');
	});

	bot.command('set_my_command', async (ctx) => {
		ctx.transaction('set_my_command');
		checkAdminUser(ctx);

		await ctx.api.setMyCommands(commandListGroup, { scope: { type: 'all_group_chats' } });
		await ctx.api.setMyCommands(commandListPrivate, { scope: { type: 'all_private_chats' } });
		for (const chat_id of admins) {
			try {
				await ctx.api.setMyCommands(commandListAdmin, { scope: { type: 'chat', chat_id } });
			} catch (e) {
				console.error(e);
			}
		}
		await ctx.reply('成功');
	});
}
