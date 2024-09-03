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

	const sqlTransactionCount = (where: string) => `
      SELECT blob1                 AS type,
             sum(_sample_interval) AS count
      FROM aquadx_bot
      WHERE index1 = 'transaction'
        AND ${where}
      GROUP BY type
	`;

	const sqlUserCount = (where: string) => `
      SELECT Count(DISTINCT blob2) as userCount
      FROM aquadx_bot
      WHERE index1 = 'transaction'
        AND ${where}
	`;

	const oneDay = () => `
			timestamp >= toDateTime(${Date.now() / 1000 - 60 * 60 * 24})
      AND timestamp < toDateTime(${Date.now() / 1000})
  `;

	const oneWeek = () => `
			timestamp >= toDateTime(${Date.now() / 1000 - 60 * 60 * 24 * 7})
      AND timestamp < toDateTime(${Date.now() / 1000})
  `;

	bot.command('stats', async (ctx) => {
		ctx.transaction('stats');
		checkAdminUser(ctx);

		const query = async (sql: string) => {
			const req = await fetch('https://api.cloudflare.com/client/v4/accounts/39a7ded207d46b8e258ee9ee2edee52a/analytics_engine/sql', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.ANAENG_CF_API_TOKEN}`
				},
				body: sql
			});
			const res = await req.json() as any;
			return res.data as Array<any>;
		};

		let stats = `用户量:\n 日: ${(await query(sqlUserCount(oneDay())))[0].userCount}\n 周: ${(await query(sqlUserCount(oneWeek())))[0].userCount}\n\n` +
			'操作数:\n 日:\n';

		const oneDayData = await query(sqlTransactionCount(oneDay()));
		for (const { type, count } of oneDayData) {
			stats += `  ${type}: ${count}\n`;
		}
		stats += ' 周:\n';
		const oneWeekData = await query(sqlTransactionCount(oneWeek()));
		for (const { type, count } of oneWeekData) {
			stats += `  ${type}: ${count}\n`;
		}
		await ctx.reply(stats);
	});
}
