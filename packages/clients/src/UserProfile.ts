import { CloudflareEnv, GameVariantPlateMusicList, PLATE_MUSIC_LIST_CN, PLATE_MUSIC_LIST_JP, Regions, UserProfileDto } from '@clansty/maibot-types';
import { UserSource } from './UserSource';
import AquaApi from './AquaApi';
import SdgbProxied from './SdgbProxied';

export class UserProfile {
	private constructor(public readonly type: UserProfileDto['type'],
		public readonly userId: number,
		private readonly client: UserSource) {
	}

	static async create(dto: UserProfileDto, env: CloudflareEnv) {
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

	public get region(): keyof Regions {
		switch (this.type) {
			case 'AquaDX':
				return 'jp';
			case 'SDGB':
				return 'cn';
			default:
		}
	}

	public get plateSongs(): GameVariantPlateMusicList {
		switch (this.region) {
			case 'jp':
				return PLATE_MUSIC_LIST_JP;
			case 'cn':
				return PLATE_MUSIC_LIST_CN;
			default:
		}
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
