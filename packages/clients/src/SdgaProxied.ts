import { UserSource } from './UserSource';
import { Nameplate, UserPreview } from '@clansty/maibot-types';

export default class SdgbProxied extends UserSource {
	public constructor(private readonly CF_ACCESS_CLIENT_ID: string,
		private readonly CF_ACCESS_CLIENT_SECRET: string) {
		super('https://sdgb-proxy.init.ink/api/exp/');
	}

	public static create(CF_ACCESS_CLIENT_ID: string, CF_ACCESS_CLIENT_SECRET: string) {
		return new this(CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET);
	}

	protected override makeHeaders(init: HeadersInit): Headers {
		const headers = super.makeHeaders(init);
		headers.set('CF-Access-Client-Id', this.CF_ACCESS_CLIENT_ID);
		headers.set('CF-Access-Client-Secret', this.CF_ACCESS_CLIENT_SECRET);
		return headers;
	}

	public async getNameplate(userId: number): Promise<Nameplate> {
		const userPreview = await this.getUserPreview(userId) as UserPreview;

		return {
			iconId: userPreview.iconId,
			// TODO: 绑定时预获取并保存
			classRank: 0,
			plateId: 1,
			courseRank: 0,
			titleId: 1,
			userName: userPreview.userName,
			playerRating: userPreview.playerRating
		};
	}

	public async resolveAime(aime: string) {
		if (!/^\d{20}$/.test(aime)) {
			throw new Error('无效 AIME');
		}

		const req = await fetch('https://sdgb-proxy.init.ink/api/aimedb/lookupV2', {
			method: 'POST',
			headers: this.makeHeaders({ 'Content-Type': 'application/json' }),
			body: JSON.stringify({ aime })
		});

		if (!req.ok) {
			const res = await req.json() as {
				message?: string;
			};
			throw new Error('请求 AimeDB 失败 ' + res.message);
		}

		return await req.json() as {
			userId: number;
			authKey: string;
		};
	}
}
