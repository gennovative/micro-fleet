import * as objection from 'objection';
import { KnexConnection } from '../interfaces';

/**
 * Wraps a database connection and transaction.
 */
export class AtomicSession {

	constructor(
		public connection: KnexConnection,
		public transaction: objection.Transaction
	) {
	}
}