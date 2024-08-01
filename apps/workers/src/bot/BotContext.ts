import { Context } from 'telegraf';
import { AquaApi, UserProfile } from '@clansty/maibot-clients';
import { UserMusic, UserProfilesKVStorage, UserRating } from '@clansty/maibot-types';
import { Env } from '../types';
import { xxhash64 } from 'cf-workers-hash';
import { InlineKeyboardButton } from 'telegraf/types';

export default class BotContext extends Context {
	private _userMusic?: UserMusic[];
	private _userRating?: UserRating;
	private _profiles?: UserProfile[];
	currentProfileId? = 0;
	env: Env;

	async getProfiles() {
		if (this._profiles) return this._profiles;
		const dto = await this.env.KV.get<UserProfilesKVStorage>(`profiles:${this.from.id}`, 'json');
		if (!dto) {
			this._profiles = [];
			return [];
		}
		this._profiles = await Promise.all(dto.profiles.map(dto => UserProfile.create(dto, this.env)));
		this.currentProfileId = dto.selected || 0;
		return this._profiles;
	}

	async saveProfiles(profiles: UserProfile[]) {
		await this.env.KV.put(`profiles:${this.from.id}`, JSON.stringify(<UserProfilesKVStorage>{
			profiles: profiles.map(p => p.dto),
			selected: this.currentProfileId
		}));
	}

	async getCurrentProfile(reply = true) {
		const profiles = await this.getProfiles();
		if (!profiles.length && reply) {
			await this.reply('请先绑定用户');
			throw new Error('User not bound');
		}
		if (this.currentProfileId >= profiles.length) {
			this.currentProfileId = 0;
		}
		return profiles[this.currentProfileId];
	}

	async selectProfile(id: number) {
		const profiles = await this.getProfiles();
		if (id >= profiles.length) {
			throw new Error('槽位不存在');
		}
		this.currentProfileId = id;
		await this.saveProfiles(profiles);
	}

	async delProfile(id: number) {
		const profiles = await this.getProfiles();
		if (id >= profiles.length) {
			throw new Error('槽位不存在');
		}
		profiles.splice(id, 1);
		await this.saveProfiles(profiles);
	}

	async getUserMusic(reply = true) {
		if (this._userMusic) return this._userMusic;
		this._userMusic = await (await this.getCurrentProfile(reply)).getUserMusic();
		return this._userMusic;
	}

	async getUserRating(reply = true) {
		if (this._userRating) return this._userRating;
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
