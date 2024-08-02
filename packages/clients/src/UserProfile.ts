import { CloudflareEnv, GameVariantPlateMusicList, PLATE_MUSIC_LIST_CN, PLATE_MUSIC_LIST_JP, Regions, Song, UserProfileDto } from '@clansty/maibot-types';
import { UserSource } from './UserSource';
import AquaDxLegacy from './AquaDxLegacy';
import SdgbProxied from './SdgbProxied';

export class UserProfile {
	private constructor(private readonly _type: UserProfileDto['type'],
		public readonly userId: string | number,
		private readonly client: UserSource) {
	}

	static async create(dto: UserProfileDto, env: CloudflareEnv) {
		let client: UserSource;
		let userId: string | number;
		switch (dto.type) {
			case 'AquaDX':
				client = await AquaDxLegacy.create(env.KV, env.POWERON_TOKEN);
				userId = dto.userId;
				break;
			case 'SDGB':
				client = SdgbProxied.create(env.CF_ACCESS_CLIENT_ID, env.CF_ACCESS_CLIENT_SECRET);
				userId = dto.userId;
				break;
			case 'AquaDX-v2':
				userId = dto.username;
		}

		return new this(dto.type, userId, client);
	}

	get dto(): UserProfileDto {
		switch (this._type) {
			case 'AquaDX':
			case 'SDGB':
				return { type: this._type, userId: this.userId as number };
			case 'AquaDX-v2':
				return { type: this._type, username: this.userId as string };
		}
	}

	get type() {
		switch (this._type) {
			case 'AquaDX':
				return 'AquaDX (Legacy)';
			case 'SDGB':
				return 'SDGB';
			default:
				throw new Error('Unknown user source');
		}
	}

	public get region(): keyof Regions {
		switch (this._type) {
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

	async getUserMusic(musicIdList: number[] | Song[]) {
		const convertedList = [] as number[];
		for (const music of musicIdList) {
			convertedList.push(music instanceof Song ? music.id : music);
			if (music instanceof Song) {
				convertedList.push(music.id, music.id + 1e4);
			}
		}
		return this.client.getUserMusic(this.userId, convertedList);
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
