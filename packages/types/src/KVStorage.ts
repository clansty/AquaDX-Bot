export abstract class KVStorage {
	abstract get<T>(key: string): Promise<T | undefined>;

	abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;

	abstract delete(key: string): Promise<void>;
}
