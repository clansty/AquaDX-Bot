import { Nameplate, UserCombinedRating, UserMusic, UserPreview, UserRating } from '@clansty/maibot-types';
import { createLogg } from '@guiiai/logg';

const log = createLogg('UserSource').useGlobalConfig()

export abstract class UserSource {
	protected constructor(protected readonly baseUrl: string) {
	}

	protected makeHeaders(init: HeadersInit) {
		return new Headers(init);
	}

	async getUserMusic(userId: number | string, musicIdList: number[]) {
		log.withFields({ userId, musicIdListLength: musicIdList.length }).log('请求 GetUserMusicApi');
		const req = await fetch(this.baseUrl + 'GetUserMusicApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: this.makeHeaders({ 'Content-Type': 'application/json' })
		});
		const data = await req.json() as any;
		return data.userMusicList[0].userMusicDetailList as UserMusic[];
	}

	async getUserRating(userId: number | string): Promise<UserCombinedRating> {
		log.withFields({ userId }).log('请求 GetUserRatingApi');
		const req = await fetch(this.baseUrl + 'GetUserRatingApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: this.makeHeaders({ 'Content-Type': 'application/json' })
		});
		const data = await req.json() as any;
		const rating = data.userRating as UserRating;

		return {
			best35: rating.ratingList,
			best15: rating.newRatingList,
			musicList: await this.getUserMusic(userId, [...rating.ratingList.map(it => it.musicId), ...rating.newRatingList.map(it => it.musicId)])
		};
	}

	public async getUserPreview(userId: number | string) {
		log.withFields({ userId }).log('请求 GetUserPreviewApi');
		const req = await fetch(this.baseUrl + 'GetUserPreviewApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: this.makeHeaders({ 'Content-Type': 'application/json' })
		});

		return await req.json() as UserPreview;
	}

	public abstract getNameplate(userId: number | string): Promise<Nameplate>;
}
