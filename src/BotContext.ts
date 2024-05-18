import { Context } from 'telegraf';
import AquaApi from './api';
import { UserMusic } from './types';
import { FmtString } from 'telegraf/format';
import { Env } from '../worker-configuration';

export default class BotContext extends Context {
	aqua: AquaApi;
	aquaUserId: number;
	userMusic: UserMusic[];
	env: Env;

	// 覆盖 reply，quote 原消息
	override reply(message: string | FmtString) {
		return super.reply(message, { reply_parameters: { message_id: this.message.message_id } });
	}

	async useUserMusic() {
		if (this.userMusic) return;
		this.aquaUserId = Number(await this.env.KV.get(`bind:${this.from.id}`));
		if (!this.aquaUserId) {
			await this.reply('请先绑定用户');
			return true;
		}
		this.aqua = await AquaApi.create(this.env.KV, this.env.API_BASE, this.env.POWERON_TOKEN);
		this.userMusic = await this.aqua.getUserMusic(this.aquaUserId);
	}
}
