import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as _ from 'lodash';
import { Model } from 'objection';
import { IConfigurationProvider, IDbConnectionDetail, constants } from '@micro-fleet/common-contracts';
import { CriticalException } from '@micro-fleet/common-util';
import { IDatabaseConnector, QueryCallback,
	EntityBase, DatabaseAddOn, AtomicSession } from '../app';

import DB_DETAILS from './database-details';

chai.use(spies);

const { DbClient, DbSettingKeys: S } = constants;
const expect = chai.expect,
	MODE_FILE = 'file',
	MODE_STRING = 'string',
	MODE_CREDENTIALS = 'credentials',
	CONN_FILE = `${process.cwd()}/database-adapter-test.sqlite`,
	CONN_STRING = 'msql://localhost@user:pass',
	CLIENT_NAME = DbClient.POSTGRESQL;

class MockConfigAddOn implements IConfigurationProvider {
	
	constructor(private _mode: string = MODE_CREDENTIALS) {
	}

	get enableRemote(): boolean {
		return true;
	}

	public get(key: string): number & boolean & string {
		if (key == S.DB_NUM_CONN) {
			return <any>1;
		}

		if (MODE_FILE == this._mode) {
			switch (key) {
				case S.DB_ENGINE + '0': return <any>DbClient.SQLITE3;
				case S.DB_FILE + '0': return <any>CONN_FILE;
				default: return null;
			}
		} else if (MODE_STRING == this._mode) {
			switch (key) {
				case S.DB_ENGINE + '0': return <any>DbClient.POSTGRESQL;
				case S.DB_CONN_STRING + '0': return <any>CONN_STRING;
				default: return null;
			}
		} else if (MODE_CREDENTIALS  == this._mode) {
			switch (key) {
				case S.DB_ENGINE + '0': return <any>DB_DETAILS.clientName;
				case S.DB_HOST + '0': return <any>DB_DETAILS.host.address;
				case S.DB_USER + '0': return <any>DB_DETAILS.host.user;
				case S.DB_PASSWORD + '0': return <any>DB_DETAILS.host.password;
				case S.DB_NAME + '0': return <any>DB_DETAILS.host.database;
				default: return null;
			}
		}
		return null;
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

class MockDbConnector implements IDatabaseConnector {
	private _connection;

	public get connection() {
		return this._connection;
	}

	public init(detail: IDbConnectionDetail, name?: string): void {
		this._connection = detail;
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public prepare<TEntity extends EntityBase>(EntityClass: any, callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any> {
		return Promise.resolve();
	}
}

describe.only('DatabaseAddOn', () => {

	describe('init', () => {
		it('should call connector.addConnection to configure database connection with database file', async () => {
			// Arrange
			let dbAddOn = new DatabaseAddOn(new MockConfigAddOn(MODE_FILE), new MockDbConnector()),
				addConnSpy = chai.spy.on(dbAddOn['_dbConnector'], 'addConnection');
			
			// Act
			await dbAddOn.init();

			// Assert
			expect(addConnSpy).to.be.spy;
			expect(addConnSpy).to.have.been.called.once;
		});

		it('should call connector.addConnection to configure database connection with connection string', async () => {
			// Arrange
			let dbAddOn = new DatabaseAddOn(new MockConfigAddOn(MODE_STRING), new MockDbConnector()),
				addConnSpy = chai.spy.on(dbAddOn['_dbConnector'], 'addConnection');
			
			// Act
			await dbAddOn.init();

			// Assert
			expect(addConnSpy).to.be.spy;
			expect(addConnSpy).to.have.been.called.once;
		});

		it('should call connector.addConnection to configure database connection with remote database', async () => {
			// Arrange
			let dbAddOn = new DatabaseAddOn(new MockConfigAddOn(MODE_CREDENTIALS), new MockDbConnector()),
				addConnSpy = chai.spy.on(dbAddOn['_dbConnector'], 'addConnection');
			
			// Act
			await dbAddOn.init();

			// Assert
			expect(addConnSpy).to.be.spy;
			expect(addConnSpy).to.have.been.called.once;
		});

		it('should throw exception if there is no settings for database connection', async () => {
			// Arrange
			let dbAddOn = new DatabaseAddOn(new MockConfigAddOn(''), new MockDbConnector()),
				exception: CriticalException = null,
				isSuccess = false;

			// Act
			try {
				await dbAddOn.init();
				isSuccess = true;
			} catch (ex) {
				exception = ex;
			}

			// Assert
			expect(isSuccess).to.be.false;
			expect(exception).to.exist;
			expect(exception).to.be.instanceOf(CriticalException);
			expect(exception.message).to.equal('No database settings!');
		});
	}); // describe 'init'
	
	describe('dispose', () => {
		it('should release all resources', async () => {
			// Arrange
			let dbAddOn = new DatabaseAddOn(new MockConfigAddOn(MODE_FILE), new MockDbConnector()),
				callMe = chai.spy();

			// Act
			await dbAddOn.init();
			await dbAddOn.dispose();

			// Assert
			_.forOwn(dbAddOn, (value, key) => {
				callMe();
				expect(dbAddOn[key], key).to.be.null;
			});
			expect(callMe).to.be.called;
		});
	}); // describe 'dispose'
});