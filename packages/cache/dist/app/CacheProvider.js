"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const RedisClustr = require("redis-clustr");
redis.Multi.prototype.execAsync = Promise.promisify(redis.Multi.prototype.exec);
const EVENT_PREFIX = '__keyspace@0__:', PRIMITIVE = 0, OBJECT = 1, ARRAY = 2;
var CacheLevel;
(function (CacheLevel) {
    /**
     * Only caches in local memory.
     */
    CacheLevel[CacheLevel["LOCAL"] = 1] = "LOCAL";
    /**
     * Only caches in remote service.
     */
    CacheLevel[CacheLevel["REMOTE"] = 2] = "REMOTE";
    /**
     * Caches in remote service and keeps sync with local memory.
     */
    CacheLevel[CacheLevel["BOTH"] = 3] = "BOTH"; // Binary: 11
})(CacheLevel = exports.CacheLevel || (exports.CacheLevel = {}));
/**
 * Provides methods to read and write data to cache.
 */
class CacheProvider {
    constructor(_options) {
        this._options = _options;
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
        }
        else {
            this.promisify(redis.RedisClient.prototype);
            this._engine = this.connectSingle();
        }
    }
    get hasEngine() {
        return (this._engine != null);
    }
    /**
     * Clears all local cache and disconnects from remote cache service.
     */
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            let tasks = [this._engine.quitAsync()];
            if (this._engineSub) {
                tasks.push(this._engineSub.quitAsync());
                this._engineSub = null;
            }
            yield Promise.all(tasks);
            this._engine = this._localCache = this._cacheTypes = this._cacheExps = null;
        });
    }
    /**
     * Removes a key from cache.
     */
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            key = this.realKey(key);
            this.deleteLocal(key);
            yield this.syncOff(key);
            yield this._engine.delAsync(key);
        });
    }
    /**
     * Retrieves a string or number or boolean from cache.
     * @param {string} key The key to look up.
     * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
     * @param {boolean} parseType (Only takes effect when `forceRemote=true`) If true, try to parse value to nearest possible primitive data type.
     * 		If false, always return string. Default is `true`. Set to `false` to save some performance.
     */
    getPrimitive(key, forceRemote = false, parseType = true) {
        key = this.realKey(key);
        if (this._cacheTypes[key] != null && this._cacheTypes[key] !== PRIMITIVE) {
            return Promise.resolve(null);
        }
        return (!(forceRemote && this.hasEngine) && this._localCache[key] !== undefined)
            ? Promise.resolve(this._localCache[key])
            : this.fetchPrimitive(key, parseType);
    }
    /**
     * Retrieves an array of strings or numbers or booleans from cache.
     * @param {string} key The key to look up.
     * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
     */
    getArray(key, forceRemote = false) {
        return __awaiter(this, void 0, void 0, function* () {
            key = this.realKey(key);
            if (this._cacheTypes[key] != null && this._cacheTypes[key] !== ARRAY) {
                return Promise.resolve(null);
            }
            let stringified = (!(forceRemote && this.hasEngine) && this._localCache[key] !== undefined)
                ? this._localCache[key]
                : yield this.fetchPrimitive(key, false);
            return JSON.parse(stringified);
        });
    }
    /**
     * Retrieves an object from cache.
     * @param {string} key The key to look up.
     * @param {boolean} forceRemote Skip local cache and fetch from remote server. Default is `false`.
     * @param {boolean} parseType (Only takes effect when `forceRemote=true`) If true, try to parse every property value to nearest possible primitive data type.
     * 		If false, always return an object with string properties.
     * 		Default is `true`. Set to `false` to save some performance.
     */
    getObject(key, forceRemote = false, parseType = true) {
        key = this.realKey(key);
        if (this._cacheTypes[key] != null && this._cacheTypes[key] !== OBJECT) {
            return Promise.resolve(null);
        }
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
    setPrimitive(key, value, duration = 0, level) {
        return __awaiter(this, void 0, void 0, function* () {
            if (value == null) {
                return;
            }
            let multi;
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
                multi.set(key, value);
                if (duration > 0) {
                    multi.expire(key, duration);
                }
                yield multi.execAsync();
            }
            if (this.hasEngine && this.has(level, CacheLevel.BOTH)) {
                yield this.syncOn(key);
            }
        });
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
    setArray(key, arr, duration = 0, level) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!arr) {
                return;
            }
            let stringified = JSON.stringify(arr), promise = this.setPrimitive(key, stringified, duration, level);
            this._cacheTypes[this.realKey(key)] = ARRAY;
            return promise;
        });
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
    setObject(key, value, duration, level) {
        return __awaiter(this, void 0, void 0, function* () {
            let multi;
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
                multi.hmset(key, value);
                if (duration > 0) {
                    multi.expire(key, duration);
                }
                yield multi.execAsync();
            }
            if (this.hasEngine && this.has(level, CacheLevel.BOTH)) {
                yield this.syncOn(key);
            }
        });
    }
    connectSingle() {
        let opts = this._options.single;
        if (!opts) {
            return null;
        }
        return redis.createClient({
            host: opts.host,
            port: opts.port
        });
    }
    defaultLevel(level) {
        return (level)
            ? level
            : (this.hasEngine) ? CacheLevel.REMOTE : CacheLevel.LOCAL;
    }
    deleteLocal(key) {
        delete this._localCache[key];
        delete this._cacheTypes[key];
        clearTimeout(this._cacheExps[key]);
        delete this._cacheExps[key];
    }
    extractKey(channel) {
        let result = this._keyRegrex.exec(channel);
        return result[1];
    }
    fetchObject(key, parseType) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this._engine.hgetallAsync(key);
            return (this._cacheTypes[key] != ARRAY && parseType) ? this.parseObjectType(data) : data;
        });
    }
    fetchPrimitive(key, parseType = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this._engine.getAsync(key);
            return (this._cacheTypes[key] != ARRAY && parseType) ? this.parsePrimitiveType(data) : data;
        });
    }
    createLockChain() {
        return [];
    }
    /**
     * Removes the last lock from lock queue then returns it.
     */
    popLock(key) {
        let lockChain = this._cacheLocks[key], lock = lockChain.pop();
        if (!lockChain.length) {
            delete this._cacheLocks[key];
        }
        return lock;
    }
    /**
     * Gets the first lock in queue.
     */
    peekLock(key) {
        return (this._cacheLocks[key]) ? this._cacheLocks[key][0] : null;
    }
    /**
     * Adds a new lock at the beginning of lock queue.
     */
    pushLock(key) {
        let lockChain = this._cacheLocks[key], releaseFn, lock = new Promise(resolve => releaseFn = resolve);
        lock['release'] = releaseFn;
        if (!lockChain) {
            lockChain = this._cacheLocks[key] = this.createLockChain();
        }
        lockChain.unshift(lock);
    }
    lockKey(key) {
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
    releaseKey(key) {
        let lock = this.popLock(key);
        lock && lock['release']();
    }
    syncOn(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let sub = this._engineSub;
            if (!sub) {
                this._keyRegrex = new RegExp(`${EVENT_PREFIX}(.*)`);
                if (!this._options.cluster) {
                    sub = this._engineSub = this.connectSingle();
                }
                else {
                    // Redis-clusr can handle bi-directional commands.
                    sub = this._engineSub = this._engine;
                }
                // TODO: This config should be in Redis conf
                yield this._engine.config('SET', 'notify-keyspace-events', 'KEA');
                sub.on('message', (channel, action) => __awaiter(this, void 0, void 0, function* () {
                    let affectedKey = this.extractKey(channel);
                    yield this.lockKey(key);
                    switch (action) {
                        case 'set':
                            // this._localCache[affectedKey] = await this.getPrimitive(affectedKey, true);
                            this._localCache[affectedKey] = yield this.fetchPrimitive(affectedKey, true);
                            break;
                        case 'hset':
                            // this._localCache[affectedKey] = await this.getObject(affectedKey, true);
                            this._localCache[affectedKey] = yield this.fetchObject(affectedKey, true);
                            break;
                        case 'del':
                            this.deleteLocal(affectedKey);
                            break;
                    }
                    this.releaseKey(key);
                }));
            }
            // Listens to changes of this key.
            yield sub.subscribeAsync(`${EVENT_PREFIX}${key}`);
        });
    }
    syncOff(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let sub = this._engineSub;
            if (!sub) {
                return;
            }
            yield sub.unsubscribeAsync(`${EVENT_PREFIX}${key}`);
        });
    }
    has(source, target) {
        return ((source & target) == target);
    }
    parsePrimitiveType(val) {
        try {
            // Try parsing to number or boolean
            return JSON.parse(val);
        }
        catch (_a) {
            return val;
        }
    }
    parseObjectType(obj) {
        for (let p in obj) {
            /* istanbul ignore else */
            if (obj.hasOwnProperty(p)) {
                obj[p] = this.parsePrimitiveType(obj[p]);
            }
        }
        return obj;
    }
    promisify(prototype) {
        for (let fn of ['del', 'hmset', 'hgetall', 'get', 'set', 'config', 'quit', 'subscribe', 'unsubscribe']) {
            prototype[`${fn}Async`] = Promise.promisify(prototype[fn]);
        }
        prototype['__promisified'] = true;
    }
    setLocalExp(key, duration) {
        if (duration > 0) {
            this._cacheExps[key] = setTimeout(() => this.deleteLocal(key), duration * 1000);
        }
    }
    realKey(key) {
        return `${this._options.name}::${key}`;
    }
}
exports.CacheProvider = CacheProvider;

//# sourceMappingURL=CacheProvider.js.map
