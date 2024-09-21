import { Bot, Context } from 'grammy';
import { commandListAdmin, commandListGroup, commandListPrivate } from './commandList';
import { Env } from '../types';
import { NoReportError } from '@clansty/maibot-core';

export default (bot: Bot, env: Env) => {
	const admins = env.ADMIN_UIDS.split(',').map(Number);

	const checkAdminUser = (ctx: Context) => {
		if (!admins.includes(ctx.from.id)) {
			throw new NoReportError('没有权限');
		}
	};

	bot.command('set_my_command', async (ctx) => {
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
