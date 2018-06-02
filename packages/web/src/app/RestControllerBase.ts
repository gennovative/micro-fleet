import * as express from 'express';
import TrailsApp = require('trails');
import TrailsController = require('trails/controller');

import { injectable, decorate, unmanaged, HandlerContainer } from 'back-lib-common-util';
import {
	SettingItem, SettingItemDataType, ISoftDelRepository,
	ModelAutoMapper, JoiModelValidator, PagedArray
} from 'back-lib-common-contracts';


export type TrailsRouteConfigItem = {
	method: string | string[],
	path: string,
	handler: string | Function,
	config?: any
};

decorate(injectable(), TrailsController);
decorate(unmanaged(), TrailsController, 0);

@injectable()
export abstract class RestControllerBase extends TrailsController {

	constructor(@unmanaged() trailsApp: TrailsApp) {
		super(trailsApp);
	}


	/*** SUCCESS ***/

	/**
	 * Responds as Accepted with status code 202 and optional data.
	 * @param res Express response object.
	 * @param data Data to optionally return to client.
	 */
	protected accepted(res: express.Response, data?: any): void {
		this.send(res, data, 202);
	}

	/**
	 * Responds as Created with status code 201 and optional data.
	 * @param res Express response object.
	 * @param data Data to optionally return to client.
	 */
	protected created(res: express.Response, data?: any): void {
		this.send(res, data, 201);
	}

	/**
	 * Responds as OK with status code 200 and optional data.
	 * @param res Express response object.
	 * @param data Data to optionally return to client.
	 */
	protected ok(res: express.Response, data?: any): void {
		this.send(res, data, 200);
	}


	/*** CLIENT ERRORS ***/

	/**
	 * Responds with error status code (default 400) and writes error to server log,
	 * then returned it to client.
	 * @param res Express response object.
	 * @param returnErr Error to dump to server log, and returned to client.
	 * @param statusCode HTTP status code. Must be 4xx. Default is 400.
	 * @param shouldLogErr Whether to write error to server log (eg: Illegal attempt to read/write resource...). Default to false.
	 */
	protected clientError(res: express.Response, returnErr: any, statusCode: number = 400, shouldLogErr: boolean = false): void {
		shouldLogErr && super.log.error(returnErr);
		statusCode = (400 <= statusCode && statusCode <= 499) ? statusCode : 400;
		if (typeof returnErr == 'number') {
			returnErr += <any>'';
		}
		res.status(statusCode).send(returnErr);
	}

	/**
	 * Responds as Forbidden with status code 403 and optional error message.
	 * @param res Express response object.
	 * @param returnErr Data to optionally return to client.
	 */
	protected forbidden(res: express.Response, returnErr?: any): void {
		this.clientError(res, returnErr, 403);
	}

	/**
	 * Responds as Not Found with status code 404 and optional error message.
	 * @param res Express response object.
	 * @param returnErr Data to optionally return to client.
	 */
	protected notFound(res: express.Response, returnErr?: any): void {
		this.clientError(res, returnErr, 404);
	}

	/**
	 * Responds as Unauthorized with status code 401 and optional error message.
	 * @param res Express response object.
	 * @param returnErr Data to optionally return to client.
	 */
	protected unauthorized(res: express.Response, returnErr?: any): void {
		this.clientError(res, returnErr, 401);
	}

	/**
	 * Responds error Precondition Failed with status code 412 and
	 * then returned error to client.
	 * @param res Express response object.
	 * @param returnErr Error to returned to client.
	 */
	protected validationError(res: express.Response, returnErr: any): void {
		this.clientError(res, returnErr, 412);
	}


	/*** SERVER ERRORS ***/

	/**
	 * Responds as Internal Error with status code 500 and
	 * writes error to server log. The error is not returned to client.
	 * @param res Express response object.
	 * @param logErr Error to dump to server log, but not returned to client.
	 */
	protected internalError(res: express.Response, logErr: any): void {
		super.log.error(logErr);
		res.status(500).send('server.error.internal');
	}


	/**
	 * Sends response to client.
	 * @param res Express response object.
	 * @param data Data to return to client.
	 * @param statusCode HTTP status code. Default is 200.
	 */
	protected send(res: express.Response, data: any, statusCode: number): express.Response {
		if (typeof data == 'number') {
			data += <any>'';
		}
		return res.status(statusCode).send(data);
	}
}