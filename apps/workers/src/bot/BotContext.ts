import { Context, InputFile } from 'grammy';
import { UserProfile } from '@clansty/maibot-clients';
import { UserProfilesKVStorage } from '@clansty/maibot-types';
import { Env } from '../types';
import { xxhash64 } from 'cf-workers-hash';
import NoReportError from '../utils/NoReportError';
import { InlineKeyboardButton, Message } from 'grammy/types';

export default class BotContext extends Context {
	private _profiles?: UserProfile[];
	currentProfileId? = 0;
	env: Env;

	async replyWithHTML(html: string, other: Parameters<this['reply']>[1] = {}) {
		return await this.reply(html, { parse_mode: 'HTML', ...other });
	}

	get args() {
		if (typeof this.match === 'string')
			return this.match.split(' ').filter(it => it);
		return [];
	}

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
		this._profiles = profiles;
		await this.env.KV.put(`profiles:${this.from.id}`, JSON.stringify(<UserProfilesKVStorage>{
			profiles: profiles.map(p => p.dto),
			selected: this.currentProfileId
		}));
	}

	async getCurrentProfile(reply = true) {
		const profiles = await this.getProfiles();
		if (!profiles.length && reply) {
			await this.reply('请先绑定用户');
			throw new NoReportError('User not bound');
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

		const { data, height } = await this.genImage(url, width);
		let messageSent: Message;
		if (height / width > 2) {
			messageSent = await this.replyWithDocument(new InputFile(Buffer.from(data), filename), {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
			if (hash)
				await this.env.KV.put(`image:${hash}`, JSON.stringify({ fileId: messageSent.document.file_id, type: 'document' }));
		} else {
			if (shareKw) {
				inlineKeyboard.push([{
					text: '分享',
					switch_inline_query: shareKw
				}]);
			}
			isFromStart = false;

			messageSent = await this.replyWithPhoto(new InputFile(Buffer.from(data), filename), {
				reply_markup: { inline_keyboard: inlineKeyboard }
			});
			if (hash)
				await this.env.KV.put(`image:${hash}`, JSON.stringify({ fileId: messageSent.photo[messageSent.photo.length - 1].file_id, type: 'image' }));
		}

		try {
			await this.deleteMessages([genMsg.message_id]);
			console.log('删除消息完成', new Date());
		} catch (e) {
			console.log('删除消息失败', e, '无所谓');
		}

		if (isFromStart) {
			try {
				await this.reply('由于图片高度太高，暂时不支持使用行内模式发送');
				console.log('发送高度提示', new Date());
			} catch (e) {
				console.log('发送消息失败', e, '无所谓');
			}
		}
	}

	async genImage(url: string, width: number) {
		const id = this.env.RENDERER.idFromName('browser');
		const obj = this.env.RENDERER.get(id);

		let req = await obj.fetch('https://do', {
			method: 'POST',
			body: JSON.stringify({ url, width })
		});

		if (!req.ok) {
			throw new Error(await req.text());
		}

		return {
			height: Number(req.headers.get('height')),
			data: await req.arrayBuffer()
		};
	}
}
