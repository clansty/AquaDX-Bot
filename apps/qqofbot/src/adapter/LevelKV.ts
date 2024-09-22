import { KVStorage } from '@clansty/maibot-types';
import { Level } from 'level';
import { createLogg } from '@guiiai/logg';

export class LevelKV extends KVStorage {
	private ldb = new Level<string, any>('data/db', { valueEncoding: 'json' });
	private logger = createLogg('LevelKV').useGlobalConfig();

	async get<T>(key: string): Promise<T | undefined> {
		try {
			this.logger.withFields({ key }).debug('取');
			return await this.ldb.get(key);
		} catch {
			return undefined;
		}
	}

	set<T>(key: string, value: T, ttl?: number): Promise<void> {
		this.logger.withFields({ key, value }).debug('置');
		return this.ldb.put(key, value);
	}

	delete(key: string): Promise<void> {
		return this.ldb.del(key);
	}
}
