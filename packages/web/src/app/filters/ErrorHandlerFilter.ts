// Handle validation errors
// Handle server internal errors

import * as express from 'express';

import { injectable, inject } from 'back-lib-common-util';
import { ValidationError } from 'back-lib-common-contracts';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class ErrorHandlerFilter {

	constructor(
		// @inject() private logProvider: ILogProvider
	) {
	}

	public handle(req: express.Request, res: express.Response, next: Function): void {
		try {
			next();
		} catch (err) {
			if (err instanceof ValidationError) {
				res.status(412).send(err);
			}
			else {
				// logProvider.error(err);
				res.status(500).send('server.error.internal');
			}
		}
	}
}