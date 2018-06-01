import { expect } from 'chai';
import { NotImplementedException } from '@micro-fleet/common-util';

import { SettingItem, SettingItemDataType, IConfigurationProvider, IDbConnectionDetail,
	DatabaseSettings, constants } from '../../app/';

const { DbSettingKeys: S, DbClient } = constants;


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
			case S.DB_NUM_CONN: return <any>4; // Plus 1 missed connection (due to bug when inserting)
			case S.DB_ENGINE + '0': return <any>DbClient.POSTGRESQL;
			case S.DB_HOST + '0': return <any>'localhost';
			case S.DB_USER + '0': return <any>'postgre';
			case S.DB_PASSWORD + '0': return <any>'postgre';
			case S.DB_NAME + '0': return <any>'postgre';
			case S.DB_ENGINE + '1': return <any>DbClient.SQLITE3;
			case S.DB_FILE + '1': return <any>'/var/data/storage.sqlite3';
			case S.DB_ENGINE + '2': return <any>DbClient.MYSQL;
			case S.DB_CONN_STRING + '2': return <any>'mysql://user@pass';
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

describe('DatabaseSettings', () => {
	describe('constructor', () => {
		it('Should create an instance with one setting', () => {
			// Act
			let target = new DatabaseSettings();

			// Assert
			expect(Number.isInteger(target.total)).to.be.true;
			expect(target.total).to.equal(0);
			expect(target[0].name).to.equal(S.DB_NUM_CONN);
			expect(target[0].value).to.equal('0');
		});
	});

	describe('pushConnection', () => {
		it('Should add setting items', () => {
			// Arrange
			let connOne: IDbConnectionDetail = {
					clientName: DbClient.POSTGRESQL,
					host: {
						address: 'localhost',
						user: 'postgre',
						password: 'postgre',
						database: 'postgre'
					}
				},
				connTwo: IDbConnectionDetail = {
					clientName: DbClient.SQLITE3,
					filePath: '/var/data/storage.sqlite3'
				},
				connThree: IDbConnectionDetail = {
					clientName: DbClient.MYSQL,
					connectionString: 'mysql://user@pass'
				};

			// Act
			let target = new DatabaseSettings();
			target.pushConnection(connOne);
			target.pushConnection(connTwo);
			target.pushConnection(connThree);

			// Assert
			expect(Number.isInteger(target.total)).to.be.true;
			expect(target.total).to.equal(3);
			expect(target[0].name).to.equal(S.DB_NUM_CONN);
			expect(target[0].value).to.equal('3');
			expect(target[1].name).to.equal(S.DB_ENGINE + '0');
			expect(target[1].value).to.equal(DbClient.POSTGRESQL);
			expect(target[6].name).to.equal(S.DB_ENGINE + '1');
			expect(target[6].value).to.equal(DbClient.SQLITE3);
			expect(target[8].name).to.equal(S.DB_ENGINE + '2');
			expect(target[8].value).to.equal(DbClient.MYSQL);
		});
	}); // END describe 'pushConnection'

	describe('fromProvider', () => {
		it('Should return an array of connection details', () => {
			// Arrange
			let provider = new MockConfigurationProvider();

			// Act
			let details = DatabaseSettings.fromProvider(provider);

			// Assert
			expect(details.length).to.equal(3);
			expect(details[0].clientName).to.equal(DbClient.POSTGRESQL);
			expect(details[0].host.address).to.equal('localhost');
			expect(details[1].clientName).to.equal(DbClient.SQLITE3);
			expect(details[2].clientName).to.equal(DbClient.MYSQL);
		});

		it('Should return null if no connection details', () => {
			// Arrange
			let provider = new EmptyConfigurationProvider();

			// Act
			let details = DatabaseSettings.fromProvider(provider);

			// Assert
			expect(details).to.be.null;
		});
	}); // END describe 'fromProvider'
});