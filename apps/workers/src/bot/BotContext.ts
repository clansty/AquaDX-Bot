import { Context } from 'telegraf';
import { AquaApi } from '@clansty/maibot-clients';
import { UserMusic, UserPreview, UserRating } from '@clansty/maibot-types';
import { Env } from '../../worker-configuration';
import { xxhash64 } from 'cf-workers-hash';
import { Message, InlineKeyboardButton } from 'telegraf/types';

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

	async genCacheSendImage(key: any, gen: () => Promise<{ data: Buffer, width: number, height: number }>, filename: string, shareKw?: string, inlineKeyboard: InlineKeyboardButton[][] = []) {
		const hash = await xxhash64(JSON.stringify(key));
		const cached = await this.env.KV.get(`image:${hash}`, 'json') as { fileId: string, type: 'image' | 'document' };
		if (cached?.type === 'image') {
			if (shareKw) {
				inlineKeyboard.push([{
					text: '分享',
					switch_inline_query: shareKw
				}]);
			}

			return await this.replyWithPhoto(cached.fileId, {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
		} else if (cached?.type === 'document') {
			return await this.replyWithDocument(cached.fileId, {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
		}

		const genMsg = this.reply('图片生成中...');
		const file = await gen();

		let message: Message;
		if (file.height / file.width > 2) {
			message = await this.replyWithDocument({ source: file.data, filename }, {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
			await this.env.KV.put(`image:${hash}`, JSON.stringify({ fileId: message.document.file_id, type: 'document' }));
		} else {
			if (shareKw) {
				inlineKeyboard.push([{
					text: '分享',
					switch_inline_query: shareKw
				}]);
			}

			message = await this.replyWithPhoto({ source: file.data, filename }, {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
			await this.env.KV.put(`image:${hash}`, JSON.stringify({ fileId: message.photo[message.photo.length - 1].file_id, type: 'image' }));
		}

		await this.deleteMessage((await genMsg).message_id);
		return message;
	}
}
