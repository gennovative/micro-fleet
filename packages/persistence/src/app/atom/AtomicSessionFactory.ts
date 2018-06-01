import { injectable, inject, Guard } from '@micro-fleet/common-util';
import { AtomicSession } from '@micro-fleet/common-contracts';

import { Types } from '../Types';
import { IDatabaseConnector } from '../connector/IDatabaseConnector';
import { AtomicSessionFlow } from './AtomicSessionFlow';


/**
 * Provides methods to create atomic sessions.
 */
@injectable()
export class AtomicSessionFactory {

	constructor(
		@inject(Types.DB_CONNECTOR) protected _dbConnector: IDatabaseConnector
	) {
		Guard.assertArgDefined('_dbConnector', _dbConnector);
	}

	/**
	 * Starts executing queries in transactions.
	 * @param {string[]} names Only executes the queries on connections with specified names.
	 */
	public startSession(...names: string[]): AtomicSessionFlow {
		return new AtomicSessionFlow(this._dbConnector, names);
	}
}