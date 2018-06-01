/**
 * Wraps a database connection and transaction.
 */
export class AtomicSession {

	constructor(
		public knexConnection,
		public knexTransaction
	) {
	}
}