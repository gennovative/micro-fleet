import { expect } from 'chai';
import * as redis from 'redis';

import { CacheProvider, CacheLevel } from '../app';


const 
	FIRST_CACHE = 'firstcache',
	LOCAL_CACHE = 'localcache',
	KEY = 'TESTKEY';

let cache: CacheProvider;

describe('CacheProvider (single)', function () {
	this.timeout(10000);

	beforeEach(() => {
		cache = new CacheProvider({
			name: FIRST_CACHE,
			single: {
				host: 'localhost'
			}
		});
	});

	afterEach(async () => {
		await cache.delete(KEY);
		await cache.dispose();
		cache = null;
	});

	describe('setPrimitive', () => {
		it('Should do nothing if value is null of undefined', async () => {
			// Arrange
			let value = null;

			// Act
			await cache.setPrimitive(KEY, value);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
		});

		it('Should save a value locally only', async () => {
			// Arrange
			let valueOne = 'saved locally',
				valueTwo = 'saved remotely',
				client = redis.createClient({
					host: 'localhost'
				});

			// Act
			await client['setAsync'](`${FIRST_CACHE}::${KEY}`, valueTwo);
			await cache.setPrimitive(KEY, valueOne, null, CacheLevel.LOCAL);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).to.equal(valueOne);
			expect(cache['_cacheTypes'][`${FIRST_CACHE}::${KEY}`]).to.exist;

			let remote = await cache.getPrimitive(KEY, true); // Skip local cache
			expect(remote).to.equal(valueTwo);

			// Clean up
			client.quit();
		});

		it('Should default to save a value locally only if no cache service is provided', async () => {
			// Arrange
			let cache = new CacheProvider({
					name: LOCAL_CACHE,
					/* No remote service */
				}),
				value = 'saved locally';

			// Act
			await cache.setPrimitive(KEY, value);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${LOCAL_CACHE}::${KEY}`]).to.equal(value);
			expect(cache['_cacheTypes'][`${LOCAL_CACHE}::${KEY}`]).to.exist;
		});

		it('Should save a value remote only', async () => {
			// Arrange
			let value = 'saved remotely';

			// Act
			await cache.setPrimitive(KEY, value, null, CacheLevel.REMOTE);

			// Assert: Local value does not exist
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
			expect(cache['_cacheExps'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
			expect(cache['_cacheTypes'][`${FIRST_CACHE}::${KEY}`]).to.exist;
			
			// Assert: Remote value exists
			let refetch = await cache.getPrimitive(KEY, true); // Skip local cache
			expect(refetch).to.equal(value);
		});

		it('Should save a value both remotely and locally', async () => {
			// Arrange
			let value = 'I am everywhere';

			// Act
			await cache.setPrimitive(KEY, value, null, CacheLevel.BOTH);

			// Assert: Remote and local values are the same
			let remote = await cache.getPrimitive(KEY, true), // Skip local cache
				local = cache['_localCache'][`${FIRST_CACHE}::${KEY}`];
			expect(remote).to.equal(local);
			expect(cache['_cacheTypes'][`${FIRST_CACHE}::${KEY}`]).to.exist;
		});

		it('Should save a value then expire locally', (done) => {
			// Arrange
			let value = 'a local string',
				SECONDS = 1;

			// Act
			cache.setPrimitive(KEY, value, SECONDS, CacheLevel.LOCAL)
				.then(() => {
					setTimeout(async () => {
						// Assert
						let refetch = await cache.getPrimitive(KEY, false);
						if (refetch) {
							console.log('Refetch:', refetch);
						}
						expect(refetch).not.to.exist;
						done();
					}, 1100); // Wait until key expires
				});

		});

		it('Should save a value then expire remotely', (done) => {
			// Arrange
			let value = 'a local string',
				SECONDS = 1;

			// Act
			cache.setPrimitive(KEY, value, SECONDS, CacheLevel.REMOTE)
				.then(() => {
					setTimeout(async () => {
						// Assert
						let refetch = await cache.getPrimitive(KEY, true);
						if (refetch) {
							console.log('Refetch:', refetch);
						}
						expect(refetch).not.to.exist;
						done();
					}, 1100); // Wait until key expires
				});

		});

		it('Should save a value then expire both locally and remotely', (done) => {
			// Arrange
			let value = 'a local string',
				SECONDS = 1;

			// Act
			cache.setPrimitive(KEY, value, SECONDS, CacheLevel.BOTH)
				.then(() => {
					setTimeout(async () => {
						// Assert
						let remote = await cache.getPrimitive(KEY, true),
							local = cache['_localCache'][`${FIRST_CACHE}::${KEY}`];
						if (remote || local) {
							console.log('Remote:', remote);
							console.log('Local:', local);
						}
						expect(remote).not.to.exist;
						expect(local).not.to.exist;
						done();
					}, 1100); // Wait until key expires
				});

		});

		it('Should save a value then keep sync', (done) => {
			// Arrange
			const KEY_TWO = 'SECKEY';
			let valueOne = 'a test string',
				valueOneNew = 'another string',
				valueTwo = 'the second string',
				valueTwoNew = 'the new second string',
				client = redis.createClient({
					host: 'localhost'
				});

			// Act
			cache.setPrimitive(KEY, valueOne, 0, CacheLevel.BOTH)
				.then(() => {
					return cache.setPrimitive(KEY_TWO, valueTwo, 0, CacheLevel.BOTH);
				})
				.then(async () => {
					await Promise.all([
						client['setAsync'](`${FIRST_CACHE}::${KEY}`, valueOneNew),
						client['setAsync'](`${FIRST_CACHE}::${KEY_TWO}`, valueTwoNew)
					]);
					client.quit();
				})
				.then(() => {
					setTimeout(async () => {
						// Assert
						let refetchOne = cache['_localCache'][`${FIRST_CACHE}::${KEY}`],
							refetchTwo = cache['_localCache'][`${FIRST_CACHE}::${KEY_TWO}`];
						expect(refetchOne).to.equal(valueOneNew);
						expect(refetchTwo).to.equal(valueTwoNew);
						done();
					}, 1000); // Wait a bit then check again.
				});
		});
	}); // describe 'setPrimitive'


	describe('getPrimitive', () => {
		it('Should get string value', async () => {
			// Arrange
			let value = 'a test string';
			await cache.setPrimitive(KEY, value);

			// Act
			let refetch = await cache.getPrimitive(KEY, true, true);

			// Assert
			expect(refetch).to.equal(value);
			expect(typeof refetch).to.equal('string');
		});

		it('Should get number value as string', async () => {
			// Arrange
			let value = 123;
			await cache.setPrimitive(KEY, value);

			// Act
			const PARSE = false;
			let refetch = await cache.getPrimitive(KEY, true, PARSE);

			// Assert
			expect(refetch).to.equal(value + '');
			expect(typeof refetch).to.equal('string');
		});

		it('Should get number value as number', async () => {
			// Arrange
			let value = 123;
			await cache.setPrimitive(KEY, value);

			// Act
			const PARSE = true;
			let refetch = await cache.getPrimitive(KEY, true, PARSE);

			// Assert
			expect(refetch).to.equal(value);
			expect(typeof refetch).to.equal('number');
		});

		it('Should get boolean value as string', async () => {
			// Arrange
			let value = true;
			await cache.setPrimitive(KEY, value);

			// Act
			const PARSE = false;
			let refetch = await cache.getPrimitive(KEY, true, PARSE);

			// Assert
			expect(refetch).to.equal(value + '');
			expect(typeof refetch).to.equal('string');
		});

		it('Should get boolean value as boolean', async () => {
			// Arrange
			let value = true;
			await cache.setPrimitive(KEY, value);

			// Act
			const PARSE = true;
			let refetch = await cache.getPrimitive(KEY, true, PARSE);

			// Assert
			expect(refetch).to.equal(value);
			expect(typeof refetch).to.equal('boolean');
		});

		it('Should get value locally if no cache service is provided', async () => {
			// Arrange
			let cache = new CacheProvider({
					name: LOCAL_CACHE,
					/* No remote service */
				}),
				value = 'a test string';
			cache['_localCache'][`${LOCAL_CACHE}::${KEY}`] = value;

			// Act
			let refetch = await cache.getPrimitive(KEY);

			// Assert
			expect(refetch).to.equal(value);
			expect(typeof refetch).to.equal('string');
		});

		it('Should return null if try to get non-primitive value', async () => {
			// Arrange
			let value = 'a test string';
			await cache.setPrimitive(KEY, value);

			// Act
			let refetch = await cache.getObject(KEY);

			// Assert
			expect(refetch).to.be.null;
		});

	}); // describe 'getPrimitive'


	describe('setArray', () => {
		it('Should do nothing if value is null of undefined', async () => {
			// Arrange
			let value = null;

			// Act
			await cache.setArray(KEY, value);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
		});

		it('Should save a primitive array', async () => {
			// Arrange
			let arr = [1, '2', false];

			// Act
			await cache.setArray(KEY, arr);

			let refetch = await cache.getArray(KEY, true); // Skip local cache
			expect(refetch).to.deep.equal(arr);
		});

		it('Should save an object array', async () => {
			// Arrange
			let arr = [
				{
					name: 'Local Gennova',
					age: 55
				},
				{
					address: 'A remote galaxy',
					since: 2017
				}
			];

			// Act
			await cache.setArray(KEY, arr);

			let refetch = await cache.getArray(KEY, true); // Skip local cache
			expect(refetch).to.deep.equal(arr);
		});
	}); // describe 'setArray'


	describe('getArray', () => {
		it('Should get a primitive array', async () => {
			// Arrange
			let arr = [1, '2', false];
			await cache.setArray(KEY, arr);

			// Act
			let refetch = await cache.getArray(KEY, true);

			// Assert
			expect(refetch).to.deep.equal(arr);
		});

		it('Should get an object array', async () => {
			// Arrange
			let arr = [
				{
					name: 'Local Gennova',
					age: 55,
					alive: true
				},
				{
					address: 'A remote galaxy',
					since: 2017
				}
			];
			await cache.setArray(KEY, arr);

			// Act
			let refetch = await cache.getArray(KEY, true);

			// Assert
			expect(refetch).to.deep.equal(arr);
		});

		it('Should return null if try to get non-array value', async () => {
			// Arrange
			let arr = 'a test string';
			await cache.setPrimitive(KEY, arr);

			// Act
			let refetch = await cache.getArray(KEY);

			// Assert
			expect(refetch).to.be.null;
		});

		it('Should get value locally if no cache service is provided', async () => {
			// Arrange
			let cache = new CacheProvider({
					name: LOCAL_CACHE,
					/* No remote service */
				}),
				arr = [1, '2', false];

			// await cache.setArray(KEY, arr);
			cache['_localCache'][`${LOCAL_CACHE}::${KEY}`] = JSON.stringify(arr);

			// Act
			let refetch = await cache.getArray(KEY);

			// Assert
			expect(refetch).to.deep.equal(arr);
		});

	}); // describe 'getArray'


	describe('setObject', () => {
		it('Should do nothing if value is null of undefined', async () => {
			// Arrange
			let obj = null;

			// Act
			await cache.setObject(KEY, obj);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
		});

		it('Should save an object locally only', async () => {
			// Arrange
			let objOne = {
					name: 'Local Gennova',
					age: 55
				},
				objTwo = {
					address: 'A remote galaxy',
					since: 2017
				},
				client = redis.createClient({
					host: 'localhost'
				});

			// Act
			await client['hmsetAsync'](`${FIRST_CACHE}::${KEY}`, objTwo);
			await cache.setObject(KEY, objOne, null, CacheLevel.LOCAL);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).to.deep.equal(objOne);
			expect(cache['_cacheTypes'][`${FIRST_CACHE}::${KEY}`]).to.exist;

			let remote = await cache.getObject(KEY, true); // Skip local cache
			expect(remote).to.deep.equal(objTwo);

			// Clean up
			client.quit();
		});

		it('Should default to save an object locally only if no cache service is provided', async () => {
			// Arrange
			let cache = new CacheProvider({
					name: LOCAL_CACHE,
					/* No remote service */
				}),
				obj = {
					name: 'Local Gennova',
					age: 55
				};

			// Act
			await cache.setObject(KEY, obj);

			// Assert: Local value is different than remote value
			expect(cache['_localCache'][`${LOCAL_CACHE}::${KEY}`]).to.deep.equal(obj);
			expect(cache['_cacheTypes'][`${LOCAL_CACHE}::${KEY}`]).to.exist;
		});

		it('Should save an object remote only', async () => {
			// Arrange
			let obj = {
					name: 'Remote Gennova',
					age: 99
				};

			// Act
			await cache.setObject(KEY, obj, null, CacheLevel.REMOTE);

			// Assert: Local value does not exist
			expect(cache['_localCache'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
			expect(cache['_cacheExps'][`${FIRST_CACHE}::${KEY}`]).not.to.exist;
			expect(cache['_cacheTypes'][`${FIRST_CACHE}::${KEY}`]).to.exist;

			// Assert: Remote value exists
			let refetch = await cache.getObject(KEY, true); // Skip local cache
			expect(refetch).to.deep.equal(obj);
		});

		it('Should save an object both remotely and locally', async () => {
			// Arrange
			let obj = {
					name: 'Gennova everywhere',
					age: 124
				};

			// Act
			await cache.setObject(KEY, obj, null, CacheLevel.BOTH);

			// Assert: Remote and local values are the same
			let remote = await cache.getObject(KEY, true), // Skip local cache
				local = cache['_localCache'][`${FIRST_CACHE}::${KEY}`];
			expect(remote).to.deep.equal(local);
			expect(cache['_cacheTypes'][`${FIRST_CACHE}::${KEY}`]).to.exist;
		});

		it('Should save an object then expire locally', (done) => {
			// Arrange
			let obj = {
					name: 'Gennova everywhere',
					age: 124
				},
				SECONDS = 1;

			// Act
			cache.setObject(KEY, obj, SECONDS, CacheLevel.LOCAL)
				.then(() => {
					setTimeout(async () => {
						// Assert
						let refetch = await cache.getObject(KEY, false);
						if (refetch) {
							console.log('Refetch:', refetch);
						}
						expect(refetch).not.to.exist;
						done();
					}, 1100); // Wait until key expires
				});

		});

		it('Should save an object then expire remotely', (done) => {
			// Arrange
			let obj = {
					name: 'Gennova everywhere',
					age: 124
				},
				SECONDS = 1;

			// Act
			cache.setObject(KEY, obj, SECONDS, CacheLevel.REMOTE)
				.then(() => {
					setTimeout(async () => {
						// Assert
						let refetch = await cache.getObject(KEY, true);
						if (refetch) {
							console.log('Refetch:', refetch);
						}
						expect(refetch).not.to.exist;
						done();
					}, 1100); // Wait until key expires
				});

		});

		it('Should save an object then keep sync', (done) => {

			// Arrange
			let objOne = {
					name: 'Sync Gennova',
					age: 987
				},
				objTwo = {
					address: 'The middle of nowhere',
					since: 2017
				},
				client = redis.createClient({
					host: 'localhost'
				});

			// Act
			cache.setObject(KEY, objOne, null, CacheLevel.BOTH)
				.then(async () => {
					await client.multi()
						.del(`${FIRST_CACHE}::${KEY}`)
						.hmset(`${FIRST_CACHE}::${KEY}`, objTwo)['execAsync']();
					client.quit();
				})
				.then(() => {
					setTimeout(async () => {
						// Assert
						let refetch: any = cache['_localCache'][`${FIRST_CACHE}::${KEY}`];
						expect(refetch).to.exist;
						expect(refetch.name).not.to.exist;
						expect(refetch.age).not.to.exist;
						expect(refetch).to.deep.equal(objTwo);
						done();
					}, 1000); // Wait a bit then check again.
				});
		});
	}); // describe 'setObject'


	describe('getObject', () => {
		it('Should get object with all string properties', async () => {
			// Arrange
			let obj = {
					name: 'Local Gennova',
					age: 55,
					alive: true
				};
			await cache.setObject(KEY, obj);

			// Act
			const PARSE = false;
			let refetch = await cache.getObject(KEY, true, PARSE);

			// Assert
			for (let p in refetch) {
				expect(refetch[p]).to.equal(obj[p] + '');
				expect(typeof refetch[p]).to.equal('string');
			}
		});

		it('Should get object with properties of their original type', async () => {
			// Arrange
			let obj = {
					name: 'Local Gennova',
					age: 55,
					alive: true
				};
			await cache.setObject(KEY, obj);

			// Act
			const PARSE = true;
			let refetch = await cache.getObject(KEY, true, PARSE);

			// Assert
			expect(refetch).to.deep.equal(obj);
		});

		it('Should get value locally if no cache service is provided', async () => {
			// Arrange
			let cache = new CacheProvider({
					name: LOCAL_CACHE,
					/* No remote service */
				}),
				obj = {
					name: 'Local Gennova',
					age: 55,
					alive: true
				};
			cache['_localCache'][`${LOCAL_CACHE}::${KEY}`] = obj;

			// Act
			let refetch = await cache.getObject(KEY);

			// Assert
			expect(refetch).to.deep.equal(obj);
		});

		it('Should return null if try to get primitive value from object key', async () => {
			// Arrange
			let obj = {
					name: 'Local Gennova',
					age: 55,
					alive: true
				};
			await cache.setObject(KEY, obj);

			// Act
			let refetch = await cache.getPrimitive(KEY);

			// Assert
			expect(refetch).to.be.null;
		});
	}); // describe 'getPrimitive'

});