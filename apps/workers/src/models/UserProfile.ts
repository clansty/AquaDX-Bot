import { UserProfileDto } from '@clansty/maibot-types';
import { UserSource } from '@clansty/maibot-clients/src/UserSource';
import { Env } from '../../worker-configuration';
import { AquaApi } from '@clansty/maibot-clients';
import SdgbProxied from '@clansty/maibot-clients/src/SdgbProxied';

export class UserProfile {
	private constructor(public readonly type: UserProfileDto['type'],
		public readonly userId: number,
		private readonly client: UserSource) {
	}

	static async create(dto: UserProfileDto, env: Env) {
		let client: UserSource;
		switch (dto.type) {
			case 'AquaDX':
				client = await AquaApi.create(env.KV, env.POWERON_TOKEN);
				break;
			case 'SDGB':
				client = SdgbProxied.create(env.CF_ACCESS_CLIENT_ID, env.CF_ACCESS_CLIENT_SECRET);
				break;
			default:
				throw new Error('Unknown user source');
		}

		return new this(dto.type, dto.userId, client);
	}

	get dto(): UserProfileDto {
		return {
			type: this.type,
			userId: this.userId
		};
	}

	async getUserMusic() {
		return this.client.getUserMusic(this.userId);
	}

	async getUserRating() {
		return this.client.getUserRating(this.userId);
	}

	async getUserPreview() {
		return this.client.getUserPreview(this.userId);
	}

	async getNameplate() {
		return this.client.getNameplate(this.userId);
	}
}
