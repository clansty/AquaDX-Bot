import { UserData } from '@clansty/maibot-types';
import { UserSource } from './UserSource';
import { createLogg } from '@guiiai/logg';

const log = createLogg('UserSource/AquaDxLegacy').useGlobalConfig()

export default class AquaDxLegacy extends UserSource {
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

	public static async create(kv: KVNamespace, powerOnToken: string) {
		let uri = await kv.get('apiBase');
		if (!uri) {
			log.log('请求 powerOn');
			uri = await AquaDxLegacy.powerOn('http://aquadx-cf.hydev.org', powerOnToken);
			const url = new URL(uri);
			// 不然会出现不会自动解压 deflate 的问题
			url.host = 'aquadx-cf.hydev.org';
			uri = url.toString();
			await kv.put('apiBase', uri, { expirationTtl: 172800 });
		}
		return new this(uri);
	}

	public async getUserData(userId: number) {
		log.withFields({ userId }).log('请求 GetUserDataApi');
		const req = await fetch(this.baseUrl + 'GetUserDataApi', {
			method: 'POST',
			body: JSON.stringify({ userId }),
			headers: { 'Content-Type': 'application/json' }
		});

		return (await req.json() as any).userData as UserData;
	}

	public async getNameplate(userId: number): Promise<UserData> {
		return await this.getUserData(userId);
	}
}
