import { KVStorage } from './KVStorage';

export class CloudflareKvAdapter extends KVStorage {
	// @ts-ignore
	public constructor(private kv: KVNamespace) {
		super();
	}

	async get<T>(key: string): Promise<T | undefined> {
		try {
			return await this.kv.get(key, 'json');
		} catch (e) {
			console.log('Error in CloudflareKvAdapter.get', e);
			return undefined;
		}
	}

	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		try {
			return await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
		} catch (e) {
			console.log('Error in CloudflareKvAdapter.set', e);
		}
	}

	delete(key: string): Promise<void> {
		return this.kv.delete(key);
	}
}
