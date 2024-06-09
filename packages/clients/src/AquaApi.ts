import { UserData, UserMusic, UserPreview, UserRating } from '@clansty/maibot-types';

export default class AquaApi {
	private constructor(private readonly baseUrl: string) {
	}

	private static async powerOn(baseUrl: string, token: string) {
		const init = {
			method: 'POST',
			body: token
		};
		// @ts-ignore
		if (typeof window !== 'undefined') {
			// @ts-ignore
			init.cache = 'no-store';
		}
		const req = await fetch(baseUrl + '/sys/servlet/PowerOn', init);
		const res = new URLSearchParams(await req.text());
		console.log(res);
		return res.get('uri') as string;
	}

	public static async create(kv: KVNamespace, baseUrl: string, powerOnToken: string) {
		let uri = await kv.get('apiBase');
		if (!uri) {
			uri = await this.powerOn(baseUrl, powerOnToken);
			const url = new URL(uri);
			// 不然会出现不会自动解压 deflate 的问题
			url.host = 'aquadx-cf.hydev.org';
			uri = url.toString();
			await kv.put('apiBase', uri, { expirationTtl: 172800 });
		}
		return new this(uri);
	}

	public async getUserMusic(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserMusicApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await req.json() as any;
		return data.userMusicList[0].userMusicDetailList as UserMusic[];
	}

	public async getUserRating(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserRatingApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await req.json() as any;
		return data.userRating as UserRating;
	}

	public async getUserPreview(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserPreviewApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: { 'Content-Type': 'application/json' }
		});

		return await req.json() as UserPreview;
	}

	public async getUserData(userId: number) {
		const req = await fetch(this.baseUrl + 'GetUserDataApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: { 'Content-Type': 'application/json' }
		});

		return (await req.json() as any).userData as UserData;
	}
}
