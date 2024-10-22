import { KVStorage } from '@clansty/maibot-types';
import { openKv, Kv } from '@deno/kv';

export class DenoKV extends KVStorage {
	private readonly kv: Promise<Kv>;

	constructor(url: string) {
		super();
		this.kv = openKv(url);
	}

	async get<T>(key: string): Promise<T | undefined> {
		try {
			const kv = await this.kv;
			const res = await kv.get<T>([key]);
			return res.value;
		} catch {
			return undefined;
		}
	}

	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		const kv = await this.kv;
		await kv.set([key], value, { expireIn: ttl ? ttl * 1000 : undefined });
	}

	async delete(key: string): Promise<void> {
		const kv = await this.kv;
		await kv.delete([key]);
	}
}
