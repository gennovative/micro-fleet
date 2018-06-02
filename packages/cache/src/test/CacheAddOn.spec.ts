import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as redis from 'redis';
import * as RedisClustr from 'redis-clustr';

import { DependencyContainer } from 'back-lib-common-util';
import { CacheSettingKeys as S } from 'back-lib-common-constants';
import { IConfigurationProvider } from 'back-lib-common-contracts';

import { CacheAddOn, CacheProvider, Types as T } from '../app';


chai.use(spies);
const expect = chai.expect;


class MockConfigAddOn implements IConfigurationProvider {

	constructor(private _mode) {
		
	}

	get enableRemote(): boolean {
		return true;
	}

	public get(key: string): number & boolean & string {
		if (!this._mode) { return null; }

		switch (key) {
			case S.CACHE_NUM_CONN: return <any>(this._mode == 'single' ? '1' : '2');
			case S.CACHE_HOST + '0': return <any>'localhost';
			case S.CACHE_PORT + '0': return <any>'6379';
			case S.CACHE_HOST + '1': return <any>'firstidea.vn';
			case S.CACHE_PORT + '1': return <any>'6380';
		}
		return <any>'';
	}

	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	public fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}

	public init(): Promise<void> {
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public onUpdate(listener: (delta: string[]) => void) {
	}
}


let depContainer: DependencyContainer;

describe('CacheAddOn', () => {

	beforeEach(() => {
		depContainer = new DependencyContainer();
	});

	afterEach(() => {
		depContainer.dispose();
	});


	describe('init', () => {
		it('should do nothing if no server is provided', async () => {
			// Arrange
			let cacheAddOn = new CacheAddOn(new MockConfigAddOn(null), depContainer);

			// Act
			await cacheAddOn.init();

			// Assert
			expect(cacheAddOn['_cacheProvider']).not.to.exist;

			// Clean up
			await cacheAddOn.dispose();
		});

		it('should connect to single server', async () => {
			// Arrange
			let cacheAddOn = new CacheAddOn(new MockConfigAddOn('single'), depContainer);

			// Act
			await cacheAddOn.init();

			// Assert
			let cacheProvider = depContainer.resolve<CacheProvider>(T.CACHE_PROVIDER);
			expect(cacheProvider['_options'].single).to.exist;
			expect(cacheProvider['_options'].single.host).to.equal('localhost');
			expect(cacheProvider['_options'].single.port).to.equal('6379');
			expect(cacheProvider['_options'].cluster).not.to.exist;

			// Clean up
			await cacheAddOn.dispose();
		});
		
		// it('should connect to cluster of servers', async () => {
		// 	// Arrange
		// 	let cacheAddOn = new CacheAddOn(new MockConfigAddOn('cluster'), depContainer);

		// 	// Act
		// 	await cacheAddOn.init();

		// 	// Assert
		// 	let cacheProvider = depContainer.resolve<CacheProvider>(T.CACHE_PROVIDER);
		// 	expect(cacheProvider['_options'].cluster).to.exist;
		// 	expect(cacheProvider['_options'].cluster.length).to.be.equal(2);
		// 	expect(cacheProvider['_options'].single).not.to.exist;

		// 	// Clean up
		// 	await cacheAddOn.dispose();
		// });
	}); // END describe 'init'


	describe('dispose', () => {
		it('should call cacheProvider.dispose', async () => {
			// Arrange
			let cacheAddOn = new CacheAddOn(new MockConfigAddOn('single'), depContainer);
			
			await cacheAddOn.init();
			let disconnectSpy = chai.spy.on(cacheAddOn['_cacheProvider'], 'dispose');

			// Act
			await cacheAddOn.dispose();

			// Assert
			expect(disconnectSpy).to.be.spy;
			expect(disconnectSpy).to.have.been.called.once;
		});
	}); // END describe 'dispose'


	describe('deadLetter', () => {
		it('should resolve (for now)', async () => {
			// Arrange
			let cacheAddOn = new CacheAddOn(new MockConfigAddOn('single'), depContainer);

			// Act
			await cacheAddOn.deadLetter();
		});
	}); // END describe 'deadLetter'
});