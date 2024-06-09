import { Context } from 'telegraf';
import { AquaApi } from '@clansty/maibot-clients';
import { UserMusic, UserPreview, UserRating } from '@clansty/maibot-types';
import { Env } from '../../worker-configuration';
import { xxhash64 } from 'cf-workers-hash';
import { InlineKeyboardButton } from 'telegraf/types';
import { RENDER_QUEUE_ITEM } from '../types';

export default class BotContext extends Context {
	private aqua?: AquaApi;
	private _aquaUserId?: number;
	private _userMusic?: UserMusic[];
	private _userRating?: UserRating;
	private _userPreview?: UserPreview;
	env: Env;

	async initAquaApi() {
		if (this.aqua) return this.aqua;
		this.aqua = await AquaApi.create(this.env.KV, this.env.API_BASE, this.env.POWERON_TOKEN);
		return this.aqua;
	}

	async getAquaUserId(reply = true) {
		if (this._aquaUserId) return this._aquaUserId;
		this._aquaUserId = Number(await this.env.KV.get(`bind:${this.from.id}`));
		if (!this._aquaUserId && reply) {
			await this.reply('请先绑定用户');
			throw new Error('User not bound');
		}
		return this._aquaUserId;
	}

	async getUserMusic(reply = true) {
		if (this._userMusic) return this._userMusic;
		if (!this.aqua) await this.initAquaApi();
		this._userMusic = await this.aqua.getUserMusic(await this.getAquaUserId(reply));
		return this._userMusic;
	}

	async getUserRating(reply = true) {
		if (this._userRating) return this._userRating;
		if (!this.aqua) await this.initAquaApi();
		this._userRating = await this.aqua.getUserRating(await this.getAquaUserId(reply));
		return this._userRating;
	}

	async getUserPreview(reply = true) {
		if (this._userPreview) return this._userPreview;
		if (!this.aqua) await this.initAquaApi();
		this._userPreview = await this.aqua.getUserPreview(await this.getAquaUserId(reply));
		return this._userPreview;
	}

	async getCacheImage(key: any) {
		const hash = await xxhash64(JSON.stringify(key));
		return await this.env.KV.get(`image:${hash}`, 'json') as { fileId: string, type: 'image' | 'document' };
	}

	async genCacheSendImage(key: any, url: string, width: number, filename: string, shareKw?: string, isFromStart = false, inlineKeyboard: InlineKeyboardButton[][] = []) {
		const hash = await xxhash64(JSON.stringify(key));
		const cached = await this.env.KV.get(`image:${hash}`, 'json') as { fileId: string, type: 'image' | 'document' };
		if (cached?.type === 'image') {
			if (shareKw) {
				inlineKeyboard.push([{
					text: '分享',
					switch_inline_query: shareKw
				}]);
			}

			await this.replyWithPhoto(cached.fileId, {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
			return;
		} else if (cached?.type === 'document') {
			await this.replyWithDocument(cached.fileId, {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
			return;
		}

		const genMsg = await this.reply('图片生成中...');

		await this.env.RENDER_QUEUE.send({
			hash, shareKw, filename, inlineKeyboard, isFromStart, url, width,
			processingMessageId: genMsg.message_id,
			chatId: this.chat.id,
			replyToMessageId: this.msgId,
			queueTime: new Date().getTime()
		});
	}
}
