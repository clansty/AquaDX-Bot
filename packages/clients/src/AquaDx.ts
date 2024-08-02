import { UserSource } from './UserSource';
import { Nameplate } from '@clansty/maibot-types';

export default class AquaDx extends UserSource {
	private readonly BASE_URL = 'https://aquadx.net/aqua';

	public constructor() {
		// all override
		super(null);
	}

	private async fetch(endpoint: string, query: Record<string, string>, method = 'GET', body?: any) {
		const url = new URL(this.BASE_URL + endpoint);
		url.search = new URLSearchParams(query).toString();
		const req = await fetch(url, {
			method,
			body: body ? JSON.stringify(body) : undefined,
			headers: body ? { 'Content-Type': 'application/json' } : undefined
		});
		if (!req.ok) {
			throw new Error(`获取数据时出错: ${req.statusText}`);
		}
		return await req.json() as any;
	}

	public override async getUserMusic(username: string, musicIdList: number[]) {
		console.log('请求 user-music-from-list', { username, musicIdListLength: musicIdList.length });
		return await this.fetch('/api/v2/game/mai2/user-music-from-list', { username }, 'POST', musicIdList);
	}

	public override async getNameplate(username: string): Promise<Nameplate> {
		console.log('请求 user-name-plate', { username });
		return await this.fetch('/api/v2/game/mai2/user-name-plate', { username });
	}

	public override async getUserRating(username: string) {
		console.log('请求 user-rating', { username });
		const data = await this.fetch('/api/v2/game/mai2/user-rating', { username });
		for (const key of ['best35', 'best15']) {
			data[key] = data[key].map(([musicId, level, romVersion, achievement]) => ({
				musicId: parseInt(musicId),
				level: parseInt(level),
				romVersion: parseInt(romVersion),
				achievement: parseInt(achievement)
			}));
		}
		return data;
	}

	public async getUserPreview(username: string) {
		console.log('请求 user-summary', { username });
		const res = await this.fetch('/api/v2/game/mai2/user-summary', { username });

		// 只需要返回这两个
		return {
			userName: res.name,
			playerRating: res.rating
		};
	}
}
