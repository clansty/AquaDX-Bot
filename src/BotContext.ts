import { Context } from 'telegraf';
import AquaApi from './api';
import { UserMusic } from './types';
import { FmtString } from 'telegraf/format';

export default class BotContext extends Context {
	aqua: AquaApi;
	aquaUserId: number;
	userMusic: UserMusic[];

	// 覆盖 reply，quote 原消息
	override reply(message: string | FmtString) {
		return super.reply(message, { reply_parameters: { message_id: this.message.message_id } });
	}
}
