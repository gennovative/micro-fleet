/// <reference path="./global.d.ts" />

declare module 'back-lib-cache-provider/dist/app/CacheProvider' {
	import { ICacheConnectionDetail } from 'back-lib-common-contracts';
	export type PrimitiveArg = string | number | boolean;
	export type PrimitiveResult = string & number & boolean;
	export type PrimitiveFlatJson = {
	    [x: string]: PrimitiveArg;
	};
	export enum CacheLevel {
	    /**
	     * Only caches in local memory.
	     */
	    LOCAL = 1,
	    /**
	     * Only caches in remote service.
	     */
	    REMOTE = 2,
	    /**
	     * Caches in remote service and keeps sync with local memory.
	     */
	    BOTH = 3,
	}
	export type CacheProviderConstructorOpts = {
	    /**
	     * Is prepended in cache key to avoid key collision between cache instances.
	     */
	    name: string;
	    /**
	     * Credentials to connect to a single cache service.
	     */
	    single?: ICacheConnectionDetail;
	    /**
	     * Credentials to connect to a cluster of cache services.
	     * This option overrides `single`.
	     */
	    cluster?: ICacheConnectionDetail[];
	};
	/**
	 * Provides methods to read and write data to cache.
	 */
	export class CacheProvider {
	    	    	    	    	    	    	    /**
	     * Stores cache type (primitive, object) of each key.
	     */
	    	    /**
	     * Stores setTimeout token of each key.
	     */
	    	    constructor(_options: CacheProviderConstructorOpts);
	    	    /**
	     * Clears all local cache and disconnects from remote cache service.
	     */
	    dispose(): Promise<void>;
	    /**
	     * Removes a key from cache.
	     */
	    delete(key: string): Promise<void>;
	    /**
	     * Retrieves a string or number or boolean from cache.
	     * @param {string} key The key to look up.
	     * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
	     * @param {boolean} parseType (Only takes effect when `forceRemote=true`) If true, try to parse value to nearest possible primitive data type.
	     * 		If false, always return string. Default is `true`. Set to `false` to save some performance.
	     */
	    getPrimitive(key: string, forceRemote?: boolean, parseType?: boolean): Promise<PrimitiveResult>;
	    /**
	     * Retrieves an array of strings or numbers or booleans from cache.
	     * @param {string} key The key to look up.
	     * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
	     */
	    getArray(key: string, forceRemote?: boolean): Promise<PrimitiveResult[]>;
	    /**
	     * Retrieves an object from cache.
	     * @param {string} key The key to look up.
	     * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
	     * @param {boolean} parseType (Only takes effect when `forceRemote=true`) If true, try to parse every property value to nearest possible primitive data type.
	     * 		If false, always return an object with string properties.
	     * 		Default is `true`. Set to `false` to save some performance.
	     */
	    getObject(key: string, forceRemote?: boolean, parseType?: boolean): Promise<PrimitiveFlatJson>;
	    /**
	     * Saves a string or number or boolean to cache.
	     * @param {string} key The key for later look up.
	     * @param {Primitive} value Primitive value to save.
	     * @param {number} duration Expiration time in seconds.
	     * @param {CacheLevel} level Whether to save in local cache only, or remote only, or both.
	     * 		If both, then local cache is kept in sync with remote value even when
	     * 		this value is updated in remote service from another app process.
	     */
	    setPrimitive(key: string, value: PrimitiveArg, duration?: number, level?: CacheLevel): Promise<void>;
	    /**
	     * Saves an array to cache.
	     * @param {string} key The key for later look up.
	     * @param {Primitive[]} arr Primitive array to save.
	     * @param {number} duration Expiration time in seconds.
	     * @param {CacheLevel} level Whether to save in local cache only, or remote only, or both.
	     * 		If both, then local cache is kept in sync with remote value even when
	     * 		this value is updated in remote service from another app process.
	     */
	    setArray(key: string, arr: any[], duration?: number, level?: CacheLevel): Promise<void>;
	    /**
	     * Saves an object to cache.
	     * @param {string} key The key for later look up.
	     * @param {PrimitiveFlatJson} value Object value to save.
	     * @param {number} duration Expiration time in seconds.
	     * @param {CacheLevel} level Whether to save in local cache only, or remote only, or both.
	     * 		If both, then local cache is kept in sync with remote value even when
	     * 		this value is updated in remote service from another app process.
	     */
	    setObject(key: string, value: PrimitiveFlatJson, duration?: number, level?: CacheLevel): Promise<void>;
	    	    	    	    	    	    	    	    /**
	     * Removes the last lock from lock queue then returns it.
	     */
	    	    /**
	     * Gets the first lock in queue.
	     */
	    	    /**
	     * Adds a new lock at the beginning of lock queue.
	     */
	    	    	    	    	    	    	    	    	    	    	    	}

}
declare module 'back-lib-cache-provider/dist/app/Types' {
	export class Types {
	    static readonly CACHE_PROVIDER: string;
	    static readonly CACHE_ADDON: string;
	}

}
declare module 'back-lib-cache-provider/dist/app/CacheAddOn' {
	import { IConfigurationProvider } from 'back-lib-common-contracts';
	import { IDependencyContainer } from 'back-lib-common-util';
	export class CacheAddOn implements IServiceAddOn {
	    	    	    	    constructor(_configProvider: IConfigurationProvider, _depContainer: IDependencyContainer);
	    /**
	     * @see IServiceAddOn.init
	     */
	    init(): Promise<void>;
	    /**
	     * @see IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @see IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	}

}
declare module 'back-lib-cache-provider' {
	import 'back-lib-common-util/dist/app/bluebirdify';
	export * from 'back-lib-cache-provider/dist/app/CacheAddOn';
	export * from 'back-lib-cache-provider/dist/app/CacheProvider';
	export * from 'back-lib-cache-provider/dist/app/Types';

}
