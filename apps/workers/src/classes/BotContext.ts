import { Context } from 'telegraf';
import AquaApi from '../client/AquaApi';
import { UserMusic, UserPreview, UserRating } from '@clansty/maibot-types';
import { Env } from '../../worker-configuration';

export default class BotContext extends Context {
	private aqua?: AquaApi;
	private _aquaUserId?: number;
	private _userMusic?: UserMusic[];
	private _userRating?: UserRating;
	private _userPreview?: UserPreview;
	env: Env;

	private async initAquaApi() {
		if (this.aqua) return this.aqua;
		this.aqua = await AquaApi.create(this.env.KV, this.env.API_BASE, this.env.POWERON_TOKEN);
		return this.aqua;
	}

	private async getAquaUserId(reply = true) {
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
}
