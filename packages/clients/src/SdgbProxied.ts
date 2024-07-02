import { UserSource } from './UserSource';
import { Nameplate } from '@clansty/maibot-types';

export default class SdgbProxied extends UserSource {
	public constructor(private readonly CF_ACCESS_CLIENT_ID: string,
		private readonly CF_ACCESS_CLIENT_SECRET: string) {
		super('https://sdgb-proxy.init.ink/api/');
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
		const userPreview = await this.getUserPreview(userId);

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

	public async resolveChime(chime: string) {
		if (!chime.startsWith('S' + 'GWCMAID')) {
			throw new Error('无效二维码');
		}
		chime = chime.slice(8 + 12);
		if (chime.length !== 64) {
			throw new Error('长度错误，请确保复制完整');
		}

		const req = await fetch(this.baseUrl + 'decodeChime', {
			method: 'POST',
			headers: this.makeHeaders({ 'Content-Type': 'application/json' }),
			body: JSON.stringify({ chime })
		});

		const res = await req.json() as {
			userId?: number;
			error?: string;
		};
		if (res.error) {
			throw new Error(res.error);
		}

		return res.userId;
	}
}
