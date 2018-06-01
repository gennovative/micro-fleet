import { transaction } from 'objection';
import { MinorException } from '@micro-fleet/common-util';

import { KnexConnection } from '../interfaces';
import { IDatabaseConnector } from '../connector/IDatabaseConnector';
import { AtomicSession } from './AtomicSession';


export type SessionTask = (session: AtomicSession, previousOutput?: any) => Promise<any>;

/**
 * Provides method to execute queries on many database connections, but still make
 * sure those queries are wrapped in transactions.
 */
export class AtomicSessionFlow {

	private _session: AtomicSession;
	private _tasks: SessionTask[];
	private _initPromise: Promise<any>;
	private _finalPromise: Promise<any>;
	private _transactionProm: Promise<any>;
	private _abortFn: (reason) => void;

	/**
	 * 
	 * @param {string[]} names Only executes the queries on connections with specified names.
	 */
	constructor(protected _dbConnector: IDatabaseConnector, names: string[]) {
		this._tasks = [];
		this.initSession();
	}

	/**
	 * Checks if it is possible to call "pipe()".
	 */
	public get isPipeClosed(): boolean {
		return (this._finalPromise != null);
	}


	/**
	 * Returns a promise which resolves to the output of the last query
	 * on primary (first) connection.
	 * This method must be called at the end of the pipe chain.
	 */
	public closePipe(): Promise<any> {
		if (!this.isPipeClosed) {
			this._finalPromise = new Promise(async (resolve, reject) => {
				this._abortFn = reject;
				try {
					await this._initPromise;
					// Clean up
					this._initPromise = null;

					// Start executing enqueued tasks
					this.loop();

					// Waits for all queries in transaction to complete,
					// `transPromises` resolves when `resolveTransaction` is called,
					// and rejects when `rejectTransaction()` is called.
					let output = await this._transactionProm;
					resolve(output);
				}
				// Error on init transaction
				catch (err) { reject(err); }
			});
		}

		return this._finalPromise;
	}

	/**
	 * Adds a task to be executed inside transaction.
	 * This method is chainable and can only be called before `closePipe()` is invoked.
	 */
	public pipe(task: SessionTask): AtomicSessionFlow {
		if (this.isPipeClosed) {
			throw new MinorException('Pipe has been closed!');
		}

		this._tasks.push(task);
		return this;
	}


	private initSession(): Promise<any[]> {
		return this._initPromise = new Promise<any>((resolveInit, rejectInit) => {
			const knexConn = this._dbConnector.connection;
			try {
				// `_transactionProm` resolves when `trans.commit()` is called,
				// and rejects when `trans.rollback()` is called.
				this._transactionProm = transaction(knexConn, trans => {
					this._session = new AtomicSession(knexConn, trans);
					resolveInit();
					return null;
				});
			} catch (error) {
				rejectInit(error);
			}
		});
	}

	private doTask(prevOutput): Promise<any[]> {
		let task = this._tasks.shift();
		prevOutput = prevOutput || [];

		if (!task) {
			// When there's no more task, we commit all transactions.
			this.resolveTransaction(prevOutput);
			return null;
		}

		// return this.collectTasksOutputs(task, prevOutputs);
		return task(this._session, prevOutput);
	}

	/*
	private collectTasksOutputs(task, prevOutputs): Promise<any> {
		// Unlike Promise.all(), this promise collects all query errors.
		return new Promise((resolve, reject) => {
			let i = 0,
				session = this._session,
				results = [],
				errors = [];

			// Execute each task on all sessions (transactions).
			// for (let s of sessions) {
				task.call(null, this._session, prevOutputs[i])
					.then(r => {
						// Collect results
						results.push(r);
						if (++i == sLen) {
							// If there is at least one error,
							// all transactions are marked as failure.
							if (errors.length) {
								reject(errors.length == 1 ? errors[0] : errors);
							} else {
								// All transactions are marked as success
								// only when all of them finish without error.
								resolve(results);
							}
						}
					})
					.catch(er => {
						errors.push(er);
						// Collect error from all queries.
						if (++i == sLen) {
							reject(errors.length == 1 ? errors[0] : errors);
						}
					});
		});
	}
	//*/

	private loop(prevOutput?): Promise<any> {
		let prevWorks = this.doTask(prevOutput);
		if (!prevWorks) {
			return;
		}

		return prevWorks
			.then(prev => {
				return this.loop(prev);
			})
			.catch(err => this.rejectTransaction(err))
			// This catches both promise errors and AtomicSessionFlow's errors.
			.catch(this._abortFn);
	}

	private resolveTransaction(output): void {
		this._session.transaction.commit(output);
		this._session = this._tasks = null; // Clean up
	}

	private rejectTransaction(error): void {
		this._session.transaction.rollback(error);
		this._session = this._tasks = null; // Clean up
	}
}