import { Nameplate, UserMusic, UserPreview, UserRating } from '@clansty/maibot-types';

export abstract class UserSource {
	protected constructor(protected readonly baseUrl: string) {
	}

	protected makeHeaders(init: HeadersInit) {
		return new Headers(init);
	}

	async getUserMusic(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserMusicApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: this.makeHeaders({ 'Content-Type': 'application/json' })
		});
		const data = await req.json() as any;
		return data.userMusicList[0].userMusicDetailList as UserMusic[];
	}

	async getUserRating(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserRatingApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: this.makeHeaders({ 'Content-Type': 'application/json' })
		});
		const data = await req.json() as any;
		return data.userRating as UserRating;
	}

	public async getUserPreview(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserPreviewApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: this.makeHeaders({ 'Content-Type': 'application/json' })
		});

		return await req.json() as UserPreview;
	}

	public abstract getNameplate(userId: number): Promise<Nameplate>;
}
