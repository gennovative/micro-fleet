import * as redis from 'redis';
import * as RedisClustr from 'redis-clustr';
redis.Multi.prototype.execAsync = (<any>Promise).promisify(redis.Multi.prototype.exec);

import { ICacheConnectionDetail } from 'back-lib-common-contracts';


type CacheLockChain = Promise<void>[];

interface RedisClient extends redis.RedisClient {
	[x: string]: any;
}

interface MultiAsync extends redis.Multi {
	[x: string]: any;
}

const EVENT_PREFIX = '__keyspace@0__:',
	PRIMITIVE = 0,
	OBJECT = 1,
	ARRAY = 2;

export type PrimitiveArg = string | number | boolean;
export type PrimitiveResult = string & number & boolean;

export type PrimitiveFlatJson = {
	[x: string]: PrimitiveArg
};

export enum CacheLevel {
	/**
	 * Only caches in local memory.
	 */
	LOCAL = 1, // Binary: 01

	/**
	 * Only caches in remote service.
	 */
	REMOTE = 2, // Binary: 10

	/**
	 * Caches in remote service and keeps sync with local memory.
	 */
	BOTH = 3 // Binary: 11
}

export type CacheProviderConstructorOpts = {
	/**
	 * Is prepended in cache key to avoid key collision between cache instances.
	 */
	name: string,

	/**
	 * Credentials to connect to a single cache service.
	 */
	single?: ICacheConnectionDetail,

	/**
	 * Credentials to connect to a cluster of cache services.
	 * This option overrides `single`.
	 */
	cluster?: ICacheConnectionDetail[]
};

/**
 * Provides methods to read and write data to cache.
 */
export class CacheProvider {
	
	private _engine: RedisClient;
	private _engineSub: RedisClient;
	private _localCache: { [x: string]: PrimitiveArg | PrimitiveFlatJson };
	private _cacheLocks: { [x: string]: CacheLockChain };
	private _keyRegrex: RegExp;
	
	/**
	 * Stores cache type (primitive, object) of each key.
	 */
	private _cacheTypes: { [x: string]: number };

	/**
	 * Stores setTimeout token of each key.
	 */
	private _cacheExps: { [x: string]: NodeJS.Timer };


	constructor(private _options: CacheProviderConstructorOpts) {
		this._localCache = {
			'@#!': null // Activate hash mode (vs. V8's hidden class mode)
		};
		this._cacheTypes = {};
		this._cacheExps = {};
		this._cacheLocks = {};

		if (_options.cluster) {
			this.promisify(RedisClustr.prototype);
			this._engine = new RedisClustr({
				servers: _options.cluster
			});
		} else {
			this.promisify(redis.RedisClient.prototype);
			this._engine = this.connectSingle();
		}
	}

	private get hasEngine(): boolean {
		return (this._engine != null);
	}

	/**
	 * Clears all local cache and disconnects from remote cache service.
	 */
	public async dispose(): Promise<void> {
		let tasks = [this._engine.quitAsync()];
		if (this._engineSub) {
			tasks.push(this._engineSub.quitAsync());
			this._engineSub = null;
		}
		await Promise.all(tasks);
		this._engine = this._localCache = this._cacheTypes = this._cacheExps = null;
	}

	/**
	 * Removes a key from cache.
	 */
	public async delete(key: string): Promise<void> {
		key = this.realKey(key);
		this.deleteLocal(key);
		await this.syncOff(key);
		await this._engine.delAsync(key);
	}

	/**
	 * Retrieves a string or number or boolean from cache.
	 * @param {string} key The key to look up.
	 * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
	 * @param {boolean} parseType (Only takes effect when `forceRemote=true`) If true, try to parse value to nearest possible primitive data type.
	 * 		If false, always return string. Default is `true`. Set to `false` to save some performance.
	 */
	public getPrimitive(key: string, forceRemote: boolean = false, parseType: boolean = true): Promise<PrimitiveResult> {
		key = this.realKey(key);
		if (this._cacheTypes[key] != null && this._cacheTypes[key] !== PRIMITIVE) { return Promise.resolve(null); }

		return (!(forceRemote && this.hasEngine) && this._localCache[key] !== undefined)
			? Promise.resolve(this._localCache[key])
			: this.fetchPrimitive(key, parseType);
	}
	/**
	 * Retrieves an array of strings or numbers or booleans from cache.
	 * @param {string} key The key to look up.
	 * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
	 */
	public async getArray(key: string, forceRemote: boolean = false): Promise<PrimitiveResult[]> {
		key = this.realKey(key);
		if (this._cacheTypes[key] != null && this._cacheTypes[key] !== ARRAY) { return Promise.resolve(null); }
		let stringified: string = (!(forceRemote && this.hasEngine) && this._localCache[key] !== undefined)
			? this._localCache[key]
			: await this.fetchPrimitive(key, false);

		return JSON.parse(stringified);
		
	}

	/**
	 * Retrieves an object from cache.
	 * @param {string} key The key to look up.
	 * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
	 * @param {boolean} parseType (Only takes effect when `forceRemote=true`) If true, try to parse every property value to nearest possible primitive data type.
	 * 		If false, always return an object with string properties. 
	 * 		Default is `true`. Set to `false` to save some performance.
	 */
	public getObject(key: string, forceRemote: boolean = false, parseType: boolean = true): Promise<PrimitiveFlatJson> {
		key = this.realKey(key);
		if (this._cacheTypes[key] != null && this._cacheTypes[key] !== OBJECT) { return Promise.resolve(null); }

		return (!(forceRemote && this.hasEngine) && this._localCache[key] !== undefined)
			? Promise.resolve(this._localCache[key])
			: this.fetchObject(key, parseType);
	}

	/**
	 * Saves a string or number or boolean to cache.
	 * @param {string} key The key for later look up.
	 * @param {Primitive} value Primitive value to save.
	 * @param {number} duration Expiration time in seconds.
	 * @param {CacheLevel} level Whether to save in local cache only, or remote only, or both.
	 * 		If both, then local cache is kept in sync with remote value even when
	 * 		this value is updated in remote service from another app process.
	 */
	public async setPrimitive(key: string, value: PrimitiveArg, duration: number = 0, level?: CacheLevel): Promise<void> {
		if (value == null) { return; }

		let multi: MultiAsync;
		level = this.defaultLevel(level);
		key = this.realKey(key);
		this._cacheTypes[key] = PRIMITIVE;

		if (this.has(level, CacheLevel.LOCAL)) {
			this._localCache[key] = value;
			this.setLocalExp(key, duration);
		}

		if (this.hasEngine && this.has(level, CacheLevel.REMOTE)) {
			multi = this._engine.multi();
			multi.del(key);
			multi.set(key, <any>value);
			if (duration > 0) {
				multi.expire(key, duration);
			}

			await multi.execAsync();
		}

		if (this.hasEngine && this.has(level, CacheLevel.BOTH)) {
			await this.syncOn(key);
		}
	}

	/**
	 * Saves an array to cache.
	 * @param {string} key The key for later look up.
	 * @param {Primitive[]} arr Primitive array to save.
	 * @param {number} duration Expiration time in seconds.
	 * @param {CacheLevel} level Whether to save in local cache only, or remote only, or both.
	 * 		If both, then local cache is kept in sync with remote value even when
	 * 		this value is updated in remote service from another app process.
	 */
	public async setArray(key: string, arr: any[], duration: number = 0, level?: CacheLevel): Promise<void> {
		if (!arr) { return; }

		let stringified = JSON.stringify(arr),
			promise = this.setPrimitive(key, stringified, duration, level);
		this._cacheTypes[this.realKey(key)] = ARRAY;
		return promise;
	}

	/**
	 * Saves an object to cache.
	 * @param {string} key The key for later look up.
	 * @param {PrimitiveFlatJson} value Object value to save.
	 * @param {number} duration Expiration time in seconds.
	 * @param {CacheLevel} level Whether to save in local cache only, or remote only, or both.
	 * 		If both, then local cache is kept in sync with remote value even when
	 * 		this value is updated in remote service from another app process.
	 */
	public async setObject(key: string, value: PrimitiveFlatJson, duration?: number, level?: CacheLevel): Promise<void> {
		let multi: MultiAsync;
		level = this.defaultLevel(level);
		key = this.realKey(key);
		this._cacheTypes[key] = OBJECT;

		if (this.has(level, CacheLevel.LOCAL)) {
			this._localCache[key] = value;
			this.setLocalExp(key, duration);
		}

		if (this.hasEngine && this.has(level, CacheLevel.REMOTE)) {
			multi = this._engine.multi();
			multi.del(key);
			multi.hmset(key, <any>value);
			if (duration > 0) {
				multi.expire(key, duration);
			}
			await multi.execAsync();
		}

		if (this.hasEngine && this.has(level, CacheLevel.BOTH)) {
			await this.syncOn(key);
		}
	}



	private connectSingle(): redis.RedisClient {
		let opts = this._options.single;
		if (!opts) { return null; }

		return redis.createClient({
			host: opts.host,
			port: opts.port
		});
	}

	private defaultLevel(level: CacheLevel): CacheLevel {
		return (level)
			? level
			: (this.hasEngine) ? CacheLevel.REMOTE : CacheLevel.LOCAL;
	}

	private deleteLocal(key: string) {
		delete this._localCache[key];
		delete this._cacheTypes[key];
		clearTimeout(this._cacheExps[key]);
		delete this._cacheExps[key];
	}

	private extractKey(channel: string): string {
		let result = this._keyRegrex.exec(channel);
		return result[1];
	}

	private async fetchObject(key: string, parseType: boolean): Promise<any> {
		let data = await this._engine.hgetallAsync(key);
		return (this._cacheTypes[key] != ARRAY && parseType) ? this.parseObjectType(data) : data;
	}

	private async fetchPrimitive(key: string, parseType: boolean = true): Promise<any> {
		let data = await this._engine.getAsync(key);
		return (this._cacheTypes[key] != ARRAY && parseType) ? this.parsePrimitiveType(data) : data;
	}

	private createLockChain(): CacheLockChain {
		return [];
	}

	/**
	 * Removes the last lock from lock queue then returns it.
	 */
	private popLock(key: string): Promise<void> {
		let lockChain: CacheLockChain = this._cacheLocks[key],
			lock = lockChain.pop();
		if (!lockChain.length) {
			delete this._cacheLocks[key];
		}
		return lock;
	}

	/**
	 * Gets the first lock in queue.
	 */
	private peekLock(key: string): Promise<void> {
		return (this._cacheLocks[key]) ? this._cacheLocks[key][0] : null;
	}

	/**
	 * Adds a new lock at the beginning of lock queue.
	 */
	private pushLock(key: string): void {
		let lockChain: CacheLockChain = this._cacheLocks[key],
			releaseFn,
			lock = new Promise<void>(resolve => releaseFn = resolve);
		lock['release'] = releaseFn;

		if (!lockChain) {
			lockChain = this._cacheLocks[key] = this.createLockChain();
		}
		lockChain.unshift(lock);
	}

	private lockKey(key: string): Promise<void> {
		let lock = this.peekLock(key);

		// Put my lock here
		this.pushLock(key);

		// If I'm the first one, I don't need to wait.
		if (!lock) {
			return Promise.resolve();
		}

		// If this key is already locked, then wait...
		return lock;
	}

	private releaseKey(key: string): void {
		let lock = this.popLock(key);
		lock && lock['release']();
	}

	private async syncOn(key: string): Promise<void> {
		let sub = this._engineSub;

		if (!sub) { 
			this._keyRegrex = new RegExp(`${EVENT_PREFIX}(.*)`);
			if (!this._options.cluster) {
				sub = this._engineSub = this.connectSingle();
			} else {
				// Redis-clusr can handle bi-directional commands.
				sub = this._engineSub = this._engine;
			}

			// TODO: This config should be in Redis conf
			await this._engine.config('SET', 'notify-keyspace-events', 'KEA');
			sub.on('message', async (channel, action) => {
				let affectedKey = this.extractKey(channel);

				await this.lockKey(key);

				switch (action) {
					case 'set':
						// this._localCache[affectedKey] = await this.getPrimitive(affectedKey, true);
						this._localCache[affectedKey] = await this.fetchPrimitive(affectedKey, true);
						break;
					case 'hset':
						// this._localCache[affectedKey] = await this.getObject(affectedKey, true);
						this._localCache[affectedKey] = await this.fetchObject(affectedKey, true);
						break;
					case 'del':
						this.deleteLocal(affectedKey);
						break;
				}
				this.releaseKey(key);
			});
		}

		// Listens to changes of this key.
		await sub.subscribeAsync(`${EVENT_PREFIX}${key}`);
	}

	private async syncOff(key: string): Promise<void> {
		let sub = this._engineSub;
		if (!sub) { return; }
		await sub.unsubscribeAsync(`${EVENT_PREFIX}${key}`);
	}

	private has(source: CacheLevel, target: CacheLevel): boolean {
		return ((source & target) == target);
	}

	private parsePrimitiveType(val: string): any {
		try {
			// Try parsing to number or boolean
			return JSON.parse(val);
		} catch {
			return val;
		}
	}

	private parseObjectType(obj: {[x: string]: string}): any {
		for (let p in obj) {
			/* istanbul ignore else */
			if (obj.hasOwnProperty(p)) {
				obj[p] = this.parsePrimitiveType(obj[p]);
			}
		}
		return obj;
	}

	private promisify(prototype: any): void {
		for (let fn of ['del', 'hmset', 'hgetall', 'get', 'set', 'config', 'quit', 'subscribe', 'unsubscribe']) {
			prototype[`${fn}Async`] = (<any>Promise).promisify(prototype[fn]);
		}
		prototype['__promisified'] = true;
	}

	private setLocalExp(key: string, duration: number): void {
		if (duration > 0) {
			this._cacheExps[key] = setTimeout(() => this.deleteLocal(key), duration * 1000);
		}
	}

	private realKey(key: string): string {
		return `${this._options.name}::${key}`;
	}
}