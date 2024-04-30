import { UserMusic } from './types';

export default class AquaApi {
	constructor(private readonly baseUrl: string) {
	}

	public static async powerOn(token: string) {

	}

	public async getUserMusic(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserMusicApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: { 'Content-Type': 'application/json' },
		});

		const data = await req.json() as any;
		return data.userMusicList[0].userMusicDetailList as UserMusic[]
	}
}
