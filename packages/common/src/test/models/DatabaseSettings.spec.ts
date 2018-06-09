import { expect } from 'chai';

import { /*SettingItemDataType, IConfigurationProvider,*/ DbConnectionDetail,
	DatabaseSettings, Maybe, constants } from '../../app/';

const { DbSettingKeys: S, DbClient } = constants;

/*
class MockConfigurationProvider implements IConfigurationProvider {
	public enableRemote: boolean = false;

	public init(): Promise<void> {
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public get(key: string): Maybe<number | boolean | string> {
		let val: any;
		switch (key) {
			case S.DB_ENGINE + '0': val = DbClient.POSTGRESQL; break;
			case S.DB_ADDRESS + '0': val = 'localhost'; break;
			case S.DB_USER + '0': val = 'postgres'; break;
			case S.DB_PASSWORD + '0': val = 'postgres'; break;
			case S.DB_NAME + '0': val = 'postgres'; break;
			case S.DB_ENGINE + '1': val = DbClient.SQLITE3; break;
			case S.DB_FILE + '1': val = '/var/data/storage.sqlite3'; break;
			case S.DB_ENGINE + '2': val = DbClient.MYSQL; break;
			case S.DB_CONN_STRING + '2': val = 'mysql://user@pass'; break;
		}
		return (val ? new Maybe(val) : new Maybe);
	}

	deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}

	onUpdate(listener: (changedKeys: string[]) => void): void {
		listener([]);
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

	public get(): Maybe<number | boolean | string> {
		return new Maybe;
	}

	deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}

	onUpdate(listener: (changedKeys: string[]) => void): void {
		listener([]);
	}
}
//*/

describe('DatabaseSettings', () => {
	describe('constructor', () => {
		it('Should create an instance with no setting', () => {
			// Act
			let target = new DatabaseSettings();

			// Assert
			expect(Number.isInteger(target.length)).to.be.true;
			expect(target.length).to.equal(0);
		});
	});

	describe('fromConnectionDetail', () => {
		it('Should parse host details', () => {
			// Arrange
			const detail: DbConnectionDetail = {
					clientName: DbClient.POSTGRESQL,
					host: {
						address: 'remotehost',
						user: 'root',
						password: 'secret',
						database: 'northwind'
					}
				};

			// Act
			const parseResult: Maybe<DatabaseSettings> = DatabaseSettings.fromConnectionDetail(detail);

			// Assert
			expect(parseResult.hasValue).to.be.true;

			const settings: DatabaseSettings = parseResult.value;
			expect(settings.length).to.equal(5);
			expect(settings[0].name).to.equal(S.DB_ENGINE);
			expect(settings[0].value).to.equal(detail.clientName);
			expect(settings[1].name).to.equal(S.DB_ADDRESS);
			expect(settings[1].value).to.equal(detail.host.address);
			expect(settings[2].name).to.equal(S.DB_USER);
			expect(settings[2].value).to.equal(detail.host.user);
			expect(settings[3].name).to.equal(S.DB_PASSWORD);
			expect(settings[3].value).to.equal(detail.host.password);
			expect(settings[4].name).to.equal(S.DB_NAME);
			expect(settings[4].value).to.equal(detail.host.database);
		});

		it('Should parse file path', () => {
			// Arrange
			let detail: DbConnectionDetail = {
				clientName: DbClient.SQLITE3,
				filePath: '/var/data/storage.sqlite3'
			};

			// Act
			const parseResult: Maybe<DatabaseSettings> = DatabaseSettings.fromConnectionDetail(detail);

			// Assert
			expect(parseResult.hasValue).to.be.true;

			const settings: DatabaseSettings = parseResult.value;
			expect(settings.length).to.equal(2);
			expect(settings[0].name).to.equal(S.DB_ENGINE);
			expect(settings[0].value).to.equal(detail.clientName);
			expect(settings[1].name).to.equal(S.DB_FILE);
			expect(settings[1].value).to.equal(detail.filePath);
		});

		it('Should parse connection string', () => {
			// Arrange
			let detail: DbConnectionDetail = {
					clientName: DbClient.MYSQL,
					connectionString: 'mysql://user@pass'
				};

			// Act
			const parseResult: Maybe<DatabaseSettings> = DatabaseSettings.fromConnectionDetail(detail);

			// Assert
			expect(parseResult.hasValue).to.be.true;

			const settings: DatabaseSettings = parseResult.value;
			expect(settings.length).to.equal(2);
			expect(settings[0].name).to.equal(S.DB_ENGINE);
			expect(settings[0].value).to.equal(detail.clientName);
			expect(settings[1].name).to.equal(S.DB_CONN_STRING);
			expect(settings[1].value).to.equal(detail.connectionString);
		});

		it('Should return empty result if engine name is not specified', () => {
			// Arrange
			let detail: DbConnectionDetail = {
					clientName: DbClient.MYSQL,
					connectionString: 'mysql://user@pass'
				};
			delete detail.clientName;

			// Act
			const parseResult: Maybe<DatabaseSettings> = DatabaseSettings.fromConnectionDetail(detail);

			// Assert
			expect(parseResult.hasValue).to.be.false;
		});

		it('Should return empty result if no connection option is specified', () => {
			// Arrange
			let detail: DbConnectionDetail = {
					clientName: DbClient.MYSQL,
				};

			// Act
			const parseResult: Maybe<DatabaseSettings> = DatabaseSettings.fromConnectionDetail(detail);

			// Assert
			expect(parseResult.hasValue).to.be.false;
		});
	}); // END describe 'fromConnectionDetail'

	/*
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
	//*/
});