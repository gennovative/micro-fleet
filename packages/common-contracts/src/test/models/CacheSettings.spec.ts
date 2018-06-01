import { expect } from 'chai';
import { NotImplementedException } from '@micro-fleet/common-util';

import { SettingItem, SettingItemDataType, IConfigurationProvider, ICacheConnectionDetail,
	CacheSettings, constants } from '../../app/';

const { CacheSettingKeys: S } = constants;

class MockConfigurationProvider implements IConfigurationProvider {
	public enableRemote: boolean = false;

	public init(): Promise<void> {
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public get(key: string, dataType?: SettingItemDataType): number & boolean & string {
		switch (key) {
			case S.CACHE_NUM_CONN: return <any>2;

			case S.CACHE_HOST + '0': return <any>'localhost';
			case S.CACHE_PORT + '0': return <any>'6379';

			case S.CACHE_HOST + '1': return <any>'firstidea.vn';
			case S.CACHE_PORT + '1': return <any>'6380';
		}
	}

	deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}

	onUpdate(listener: (changedKeys: string[]) => void): void {
		return;
	}
}

class EmptyConfigurationProvider implements IConfigurationProvider {
	public enableRemote: boolean = false;

	public init(): Promise<void> {
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public get(key: string, dataType?: SettingItemDataType): number & boolean & string {
		return null;
	}

	deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}

	onUpdate(listener: (changedKeys: string[]) => void): void {
		return;
	}
}

describe('CacheSettings', () => {
	describe('constructor', () => {
		it('Should create an instance with one setting', () => {
			// Act
			let target = new CacheSettings();

			// Assert
			expect(Number.isInteger(target.total)).to.be.true;
			expect(target.total).to.equal(0);
			expect(target[0].name).to.equal(S.CACHE_NUM_CONN);
			expect(target[0].value).to.equal('0');
		});
	});

	describe('pushConnection', () => {
		it('Should add setting items', () => {
			// Arrange
			let connOne: ICacheConnectionDetail = {
					host: 'localhost',
					port: 6379
				},
				connTwo: ICacheConnectionDetail = {
					host: 'firstidea.vn',
					port: 6380
				};

			// Act
			let target = new CacheSettings();
			target.pushConnection(connOne);
			target.pushConnection(connTwo);

			// Assert
			expect(Number.isInteger(target.total)).to.be.true;
			expect(target.total).to.equal(2);
			expect(target[0].name).to.equal(S.CACHE_NUM_CONN);
			expect(target[0].value).to.equal('2');
			expect(target[1].name).to.equal(S.CACHE_HOST + '0');
			expect(target[1].value).to.equal('localhost');
			expect(target[2].name).to.equal(S.CACHE_PORT + '0');
			expect(target[2].value).to.equal('6379');
			expect(target[3].name).to.equal(S.CACHE_HOST + '1');
			expect(target[3].value).to.equal('firstidea.vn');
			expect(target[4].name).to.equal(S.CACHE_PORT + '1');
			expect(target[4].value).to.equal('6380');
		});
	}); // END describe 'pushConnection'

	describe('fromProvider', () => {
		it('Should return an array of connection details', () => {
			// Arrange
			let provider = new MockConfigurationProvider();

			// Act
			let details = CacheSettings.fromProvider(provider);

			// Assert
			expect(details.length).to.equal(2);
			expect(details[0].host).to.equal('localhost');
			expect(details[0].port).to.equal('6379');
			expect(details[1].host).to.equal('firstidea.vn');
			expect(details[1].port).to.equal('6380');
		});

		it('Should return null if no connection details', () => {
			// Arrange
			let provider = new EmptyConfigurationProvider();

			// Act
			let details = CacheSettings.fromProvider(provider);

			// Assert
			expect(details).to.be.null;
		});
	}); // END describe 'fromProvider'
});