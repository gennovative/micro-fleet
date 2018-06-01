import * as http from 'http';

import * as express from 'express';
import * as bodyParser from 'body-parser';

import { injectable, inject, IDependencyContainer, Guard, Exception, HandlerContainer,
	ActionFactory, HandlerDetails, Types as CmT } from '@micro-fleet/common-util';

import * as rpc from './RpcCommon';


export interface ExpressRpcHandlerInitOptions {
	expressApp: express.Express;
	expressRouter: express.Router;
}

export interface IDirectRpcHandler extends rpc.IRpcHandler {
	/**
	 * Http ports to listen
	 */
	port: number;

	/**
	 * @override
	 * @see IRpcHandler.init
	 */
	init(params?: ExpressRpcHandlerInitOptions): void;

	/**
	 * @override IRpcHandler.handle to return void.
	 */
	handle(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): void;
}

@injectable()
export class ExpressRpcHandler
			extends rpc.RpcHandlerBase
			implements IDirectRpcHandler {

	private static URL_TESTER: RegExp = (function() {
			let regexp = new RegExp(/^[a-zA-Z0-9_-]*$/);
			regexp.compile();
			return regexp;
		})();


	private _server: http.Server;
	private _app: express.Express;
	private _router: express.Router;
	private _port: number;
	private _container: HandlerContainer;


	constructor(
		@inject(CmT.DEPENDENCY_CONTAINER) depContainer: IDependencyContainer
	) {
		super(depContainer);
		this._port = 30000;
		this._container = HandlerContainer.instance;
		this._container.dependencyContainer = depContainer;
	}


	public get port(): number {
		return this._port;
	}

	public set port(val: number) {
		if (val > 0 && val <= 65535) {
			this._port = val;
		}
	}

	/**
	 * @see IDirectRpcHandler.init
	 */
	public init(param?: ExpressRpcHandlerInitOptions): void {
		Guard.assertIsFalsey(this._router, 'This RPC Caller is already initialized!');
		Guard.assertIsTruthy(this.name, '`name` property must be set!');
		Guard.assertIsTruthy(this.module, '`module` property must be set!');

		let app: express.Express;
		app = this._app = (param && param.expressApp) 
			? param.expressApp 
			: express();

		this._router = (param && param.expressRouter) ? param.expressRouter : express.Router();
		//app.use(bodyParser.urlencoded({extended: true})); // Parse Form values in POST request, but I don't think we need it in this case.
		app.use(bodyParser.json()); // Parse JSON in POST request
		app.use(`/${this.module}`, this._router);
		
	}

	/**
	 * @see IRpcHandler.start
	 */
	public start(): Promise<void> {
		return new Promise<void>(resolve => {
			this._server = this._app.listen(this._port, resolve);
			this._server.on('error', err => this.emitError(err));
		});
	}

	/**
	 * @see IRpcHandler.dispose
	 */
	public dispose(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._server.close(() => {
				this._server = null;
				resolve();
			});
		});
	}

	/**
	 * @see IRpcHandler.handle
	 */
	public handle(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): void {
		Guard.assertIsDefined(this._router, '`init` method must be called first!');
		
		actions = Array.isArray(actions) ? actions : [actions];
		
		for (let a of actions) {
			Guard.assertIsMatch(ExpressRpcHandler.URL_TESTER, a, `Route "${a}" is not URL-safe!`);
			this._container.register(a, dependencyIdentifier, actionFactory);
			this._router.post(`/${a}`, this.onRequest.bind(this));
		}
	}


	private onRequest(req: express.Request, res: express.Response): void {
		let action = req.url.match(/[^\/]+$/)[0],
			request: rpc.IRpcRequest = req.body;

		(new Promise((resolve, reject) => {
			let actionFn = this._container.resolve(action);
			try {
				// Execute controller's action
				let output: any = actionFn(request.payload, resolve, reject, request);
				if (output instanceof Promise) {
					output.catch(reject); // Catch async exceptions.
				}
			} catch (err) { // Catch normal exceptions.
				reject(err);
			}
		}))
		.then(result => {
			res.status(200).send(this.createResponse(true, result, request.from));
		})
		.catch(error => {
			let statusCode = 500,
				errObj = this.createError(error);
			res.status(statusCode).send(this.createResponse(false, errObj, request.from));
		})
		// Catch error thrown by `createError()`
		.catch(this.emitError.bind(this));
	}
}