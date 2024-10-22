import { BotAdapter } from './adapter/Bot';
import { Env } from './types';
import { CommandEvent } from './adapter/MessageEvent';
import { GroupMessageEvent } from 'qq-official-bot';

export default {
	attachHandlers(bot: BotAdapter, env: Env) {
		bot.registerCommand('fusion-syn', async (event: CommandEvent) => {
			if (event.isPrivate) return;
			const msgData = event.data as GroupMessageEvent;
			if (msgData.sender.user_id !== env.USER_BOT_ID) return;

			const message = await event.reply().setText('/fusion-ack').dispatch();
			await env.KV.set(`fusion:${msgData.group_id}`, true);

			setTimeout(async () => {
				await message.delete();
			}, 3000);

			return true;
		});
	},
	async checkFusion(groupId: string, env: Env) {
		return await env.KV.get<boolean>(`fusion:${groupId}`) ?? false;
	}
};
