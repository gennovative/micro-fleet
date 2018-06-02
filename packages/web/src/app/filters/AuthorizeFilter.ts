// Handle validation errors
// Handle server internal errors

import * as express from 'express';

import { injectable, inject } from 'back-lib-common-util';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class AuthorizeFilter {

	constructor(
		// @inject() private logProvider: ILogProvider
	) {
	}

	public authenticate(req: express.Request, res: express.Response, next: Function): any {
		if (!req.header('Authorization')) {
			return res.status(401).send();
		}
		// Decode token to get user ID
		// Look up user role based on user ID
		// Check if
		next();
	}
}