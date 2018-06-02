import * as express from 'express';
import { decorators } from '../decorators';
const { lazyInject } = decorators;

import { AuthAddOn } from '../AuthAddOn';
import { Types as aT } from '../Types';
import { TokenType } from '../constants/AuthConstant';

export class AuthFilter {

	@lazyInject(aT.AUTH_ADDON) private _authAddon: AuthAddOn;

	public async guard(request: express.Request, response: express.Response, next: Function): Promise<any> {
		try {
			const authResult = await this._authAddon.authenticate(request, response, next);
			if (!authResult || !authResult.payload) {
				return response.status(401).json({message: authResult.info.message, name: authResult.info.name});
			}
			request.params['accountId'] = authResult.payload.accountId;
			request.params['username'] = authResult.payload.username;
			next();
		} catch (error) {
			// response status 401 Unthorized
		}
	}
}