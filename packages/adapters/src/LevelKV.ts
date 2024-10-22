import { KVStorage } from '@clansty/maibot-types';
import { Level } from 'level';

export class LevelKV extends KVStorage {
	private ldb = new Level<string, any>('data/db', { valueEncoding: 'json' });

	async get<T>(key: string): Promise<T | undefined> {
		try {
			return await this.ldb.get(key);
		} catch {
			return undefined;
		}
	}

	set<T>(key: string, value: T, ttl?: number): Promise<void> {
		return this.ldb.put(key, value);
	}

	delete(key: string): Promise<void> {
		return this.ldb.del(key);
	}
}
