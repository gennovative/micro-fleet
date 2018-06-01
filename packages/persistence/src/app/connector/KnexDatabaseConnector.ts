import * as knex from 'knex';
import { Model, QueryBuilder, transaction } from 'objection';
const isEmpty = require('lodash/isEmpty');

import { injectable, Guard, MinorException } from '@micro-fleet/common-util';
import { IDbConnectionDetail } from '@micro-fleet/common-contracts';

import { KnexConnection } from '../interfaces';
import { AtomicSession } from '../atom/AtomicSession';
import { EntityBase } from '../bases/EntityBase';
import { IDatabaseConnector, QueryCallback } from './IDatabaseConnector';


/**
 * Provides settings from package
 */
@injectable()
export class KnexDatabaseConnector implements IDatabaseConnector {
	
	private _connection: KnexConnection;
	private _knex; // for unittest mocking

	constructor() {
		this._knex = knex;
	}

	/**
	 * @see IDatabaseConnector.connection
	 */
	public get connection(): KnexConnection {
		return this._connection;
	}

	/**
	 * @see IDatabaseConnector.init
	 */
	public init(detail: IDbConnectionDetail): void {
		Guard.assertArgDefined('detail', detail);

		const settings = {
				client: detail.clientName,
				useNullAsDefault: true,
				connection: this.buildConnSettings(detail)
			},
			knexConn: KnexConnection = 
		this._connection = this._knex(settings);
	}

	/**
	 * @see IDatabaseConnector.dispose
	 */
	public async dispose(): Promise<void> {
		this._connection.destroy();
		this._connection = null;
		this._knex = null;
	}

	/**
	 * @see IDatabaseConnector.prepare
	 */
	public prepare<TEntity extends EntityBase>(EntityClass, callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any> {
		Guard.assertIsNotEmpty(this._connection, 'Must call addConnection() before executing any query.');
		if (atomicSession) {
			return this.prepareTransactionalQuery(EntityClass, callback, atomicSession);
		}
		return this.prepareSimpleQuery(EntityClass, callback);
	}


	private buildConnSettings(detail: IDbConnectionDetail): any {
		// 1st priority: connect to a local file.
		if (detail.filePath) {
			return { filename: detail.filePath };
		}

		// 2nd priority: connect with a connection string.
		if (detail.connectionString) {
			return detail.connectionString;
		}

		// Last priority: connect with host credentials.
		if (detail.host) {
			return {
				host: detail.host.address,
				user: detail.host.user,
				password: detail.host.password,
				database: detail.host.database,
			};
		}
		throw new MinorException('No database settings!');
	}

	private prepareSimpleQuery<TEntity>(EntityClass, callback: QueryCallback<TEntity>): Promise<any> {
		let BoundClass = EntityClass['bindKnex'](this._connection);
		return callback(BoundClass['query'](), BoundClass);
	}

	private prepareTransactionalQuery<TEntity>(EntityClass, callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any> {
		const BoundClass = EntityClass['bindKnex'](atomicSession.connection);
		return callback(BoundClass['query'](atomicSession.transaction), BoundClass);
	}

}