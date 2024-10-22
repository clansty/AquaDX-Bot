import { BotAdapter } from './adapter/Bot';
import { Env } from './types';
import { CommandEvent } from './adapter/MessageEvent';
import { MessageHandler } from 'node-napcat-ts';

export default {
	attachHandlers(bot: BotAdapter, env: Env) {
		bot.registerCommand('fusion', async (event: CommandEvent) => {
			if (event.isPrivate) return;
			const msgData = event.data as MessageHandler['message.group'];
			if (msgData.sender.role === 'member') {
				await event.reply().setText('此命令仅限管理员使用').dispatch();
				return true;
			}

			// 光明正大 IPC
			const sendRes = await bot.callApi('send_group_msg', {
				group_id: msgData.group_id,
				message: [
					{ type: 'at', data: { qq: env.OFFICIAL_BOT_UIN.toString() } },
					{ type: 'text', data: { text: '/fusion-syn' } }
				]
			});

			setTimeout(async () => {
				await bot.callApi('delete_msg', { message_id: sendRes.message_id });
			}, 3000);

			return true;
		});

		bot.registerCommand('fusion-ack', async (event: CommandEvent) => {
			if (event.isPrivate) return;
			const msgData = event.data as MessageHandler['message.group'];
			if (msgData.sender.user_id !== env.OFFICIAL_BOT_UIN) return;

			await env.KV.set(`fusion:${msgData.group_id}`, true);
			await event.reply().setText('Bot 融合模式开启成功！').dispatch();

			return true;
		});
	},
	async checkFusion(groupId: number, env: Env) {
		return await env.KV.get<boolean>(`fusion:${groupId}`) ?? false;
	}
};
