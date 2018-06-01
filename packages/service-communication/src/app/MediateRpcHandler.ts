import { injectable, inject, IDependencyContainer, Guard, HandlerContainer,
	ActionFactory, HandlerDetails, Exception, Types as CmT } from '@micro-fleet/common-util';

import { Types as T } from './Types';
import { IMessageBrokerConnector, IMessage, MessageHandleFunction } from './MessageBrokerConnector';
import * as rpc from './RpcCommon';


export interface IMediateRpcHandler extends rpc.IRpcHandler {
	/**
	 * @override IRpcHandler.handle to return Promise<void>
	 */
	handle(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Promise<void>;
	
	/**
	 * Handles countAll, create, delete, find, patch, update.
	 */
	handleCRUD(dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Promise<void>;
}

@injectable()
export class MessageBrokerRpcHandler
	extends rpc.RpcHandlerBase
	implements IMediateRpcHandler {

	private _container: HandlerContainer;

	constructor(
		@inject(CmT.DEPENDENCY_CONTAINER) depContainer: IDependencyContainer,
		@inject(T.MSG_BROKER_CONNECTOR) private _msgBrokerConn: IMessageBrokerConnector
	) {
		super(depContainer);
		Guard.assertArgDefined('_msgBrokerConn', _msgBrokerConn);
		this._container = HandlerContainer.instance;
		this._container.dependencyContainer = depContainer;
	}


	/**
	 * @see IRpcHandler.init
	 */
	public init(params?: any): void {
		this._msgBrokerConn && this._msgBrokerConn.onError(err => this.emitError(err));
	}

	/**
	 * @see IRpcHandler.start
	 */
	public start(): Promise<void> {
		return this._msgBrokerConn.listen(this.onMessage.bind(this));
	}

	/**
	 * @see IRpcHandler.dispose
	 */
	public dispose(): Promise<void> {
		// Stop listening then unsbuscribe all topic patterns.
		return <any>Promise.all([
			this._msgBrokerConn.stopListen(),
			this._msgBrokerConn.unsubscribeAll()
		]);
	}

	/**
	 * @see IMediateRpcHandler.handle
	 */
	public async handle(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Promise<void> {
		Guard.assertIsDefined(this.name, '`name` property is required.');
		Guard.assertIsDefined(this.module, '`module` property is required.');

		actions = Array.isArray(actions) ? actions : [actions];

		return <any>Promise.all(
			actions.map(a => {
				this._container.register(a, dependencyIdentifier, actionFactory);
				return this._msgBrokerConn.subscribe(`request.${this.module}.${a}`);
			})
		);
	}

	/**
	 * @see IMediateRpcHandler.handleCRUD
	 */
	public handleCRUD(dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Promise<void> {
		return this.handle(
			['countAll', 'create', 'delete', 'find', 'patch', 'update'],
			dependencyIdentifier, actionFactory
		);
	}


	private onMessage(msg: IMessage): void {
		let action = msg.raw.fields.routingKey.match(/[^\.]+$/)[0],
			request: rpc.IRpcRequest = msg.data,
			correlationId = msg.properties.correlationId,
			replyTo: string = msg.properties.replyTo;

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
		.then(result => { // When `actionFn` calls `resolve` from inside.
			// Sends response to reply topic
			return this._msgBrokerConn.publish(replyTo, this.createResponse(true, result, request.from), { correlationId });
		})
		.catch(error => {
			let errObj = this.createError(error);
			// nack(); // Disable this, because we use auto-ack.
			return this._msgBrokerConn.publish(replyTo, this.createResponse(false, errObj, request.from), { correlationId });
		})
		// Catch error thrown by `createError()`
		.catch(this.emitError.bind(this));
	}

}