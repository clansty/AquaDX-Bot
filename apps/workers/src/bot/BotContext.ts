import { Context } from 'telegraf';
import { AquaApi } from '@clansty/maibot-clients';
import { UserMusic, UserPreview, UserProfileDto, UserProfilesKVStorage, UserRating } from '@clansty/maibot-types';
import { Env } from '../../worker-configuration';
import { xxhash64 } from 'cf-workers-hash';
import { InlineKeyboardButton } from 'telegraf/types';
import { RENDER_QUEUE_ITEM } from '../types';
import { UserProfile } from '../models/UserProfile';
import * as repl from 'node:repl';

export default class BotContext extends Context {
	private aqua?: AquaApi;
	private _userMusic?: UserMusic[];
	private _userRating?: UserRating;
	private _profiles?: UserProfile[];
	private _currentProfileId? = 0;
	env: Env;

	async initAquaApi() {
		if (this.aqua) return this.aqua;
		this.aqua = await AquaApi.create(this.env.KV, this.env.POWERON_TOKEN);
		return this.aqua;
	}

	async getProfiles() {
		if (this._profiles) return this._profiles;
		const dto = await this.env.KV.get<UserProfilesKVStorage>(`profiles:${this.from.id}`, 'json');
		if (!dto) {
			this._profiles = [];
			return [];
		}
		this._profiles = await Promise.all(dto.profiles.map(dto => UserProfile.create(dto, this.env)));
		this._currentProfileId = dto.selected || 0;
		return this._profiles;
	}

	async saveProfiles(profiles: UserProfile[]) {
		await this.env.KV.put(`profiles:${this.from.id}`, JSON.stringify(<UserProfilesKVStorage>{
			profiles: profiles.map(p => p.dto),
			selected: this._currentProfileId
		}));
	}

	async getCurrentProfile(reply = true) {
		const profiles = await this.getProfiles();
		if (!profiles.length && reply) {
			await this.reply('请先绑定用户');
			throw new Error('User not bound');
		}
		if (this._currentProfileId >= profiles.length) {
			this._currentProfileId = 0;
		}
		return profiles[this._currentProfileId];
	}

	async selectProfile(id: number) {
		const profiles = await this.getProfiles();
		if (id >= profiles.length) {
			throw new Error('槽位不存在');
		}
		this._currentProfileId = id;
		await this.saveProfiles(profiles);
	}

	async getUserMusic(reply = true) {
		if (this._userMusic) return this._userMusic;
		this._userMusic = await (await this.getCurrentProfile(reply)).getUserMusic();
		return this._userMusic;
	}

	async getUserRating(reply = true) {
		if (this._userRating) return this._userRating;
		if (!this.aqua) await this.initAquaApi();
		this._userRating = await (await this.getCurrentProfile(reply)).getUserRating();
		return this._userRating;
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
