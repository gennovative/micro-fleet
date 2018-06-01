/// <reference path="./global.d.ts" />

declare module '@micro-fleet/service-communication/dist/app/RpcCommon' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { IDependencyContainer, ActionFactory } from '@micro-fleet/common-util';
	export interface IRpcRequest {
	    from: string;
	    to: string;
	    payload: any;
	}
	export interface IRpcResponse {
	    isSuccess: boolean;
	    from: string;
	    to: string;
	    payload: any;
	}
	export interface IRpcCaller {
	    /**
	     * A name used in "from" and "to" request property.
	     */
	    name: string;
	    /**
	     * Number of milliseconds to wait for response before cancelling the request.
	     * Must be between (inclusive) 1000 and 60000 (Min: 1s, Max: 60s).
	     */
	    timeout: number;
	    /**
	     * Sets up this RPC caller with specified `param`. Each implementation class requires
	     * different kinds of `param`.
	     */
	    init(params?: any): any;
	    /**
	     * Clear resources.
	     */
	    dispose(): Promise<void>;
	    /**
	     * Sends a request to `moduleName` to execute `action` with `params`.
	     * @param moduleName The module to send request.
	     * @param action The function name to call on `moduleName`.
	     * @param params Parameters to pass to function `action`.
	     */
	    call(moduleName: string, action: string, params?: any): Promise<IRpcResponse>;
	    /**
	     * Registers a listener to handle errors.
	     */
	    onError(handler: (err) => void): void;
	}
	export type RpcControllerFunction = (requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest) => any;
	export interface IRpcHandler {
	    /**
	     * A name used in "from" and "to" request property.
	     */
	    name: string;
	    /**
	     * A name used to construct subscription topic.
	     */
	    module: string;
	    /**
	     * Sets up this RPC handler with specified `param`. Each implementation class requires
	     * different kinds of `param`.
	     */
	    init(params?: any): any;
	    /**
	     * Waits for incoming request, resolves an instance with `dependencyIdentifier`,
	     * calls instance's `action` method. If `customAction` is specified,
	     * calls instance's `customAction` instead.
	     */
	    handle(action: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): any;
	    /**
	     * Registers a listener to handle errors.
	     */
	    onError(handler: (err) => void): void;
	    /**
	     * Starts listening to requests.
	     */
	    start(): Promise<void>;
	    /**
	     * Stops handling requests and removes registered actions.
	     */
	    dispose(): Promise<void>;
	}
	export abstract class RpcCallerBase {
	    /**
	     * @see IRpcCaller.name
	     */
	    name: string;
	    	    protected _emitter: EventEmitter;
	    constructor();
	    /**
	     * @see IRpcCaller.timeout
	     */
	    /**
	     * @see IRpcCaller.timeout
	     */
	    timeout: number;
	    dispose(): Promise<void>;
	    /**
	     * @see IRpcCaller.onError
	     */
	    onError(handler: (err) => void): void;
	    protected emitError(err: any): void;
	    protected rebuildError(payload: any): any;
	}
	export abstract class RpcHandlerBase {
	    protected _depContainer: IDependencyContainer;
	    /**
	     * @see IRpcHandler.name
	     */
	    name: string;
	    /**
	     * @see IRpcHandler.module
	     */
	    module: string;
	    protected _emitter: EventEmitter;
	    constructor(_depContainer: IDependencyContainer);
	    /**
	     * @see IRpcHandler.onError
	     */
	    onError(handler: (err) => void): void;
	    protected emitError(err: any): void;
	    protected createResponse(isSuccess: any, payload: any, replyTo: string): IRpcResponse;
	    protected createError(rawError: any): any;
	}

}
declare module '@micro-fleet/service-communication/dist/app/DirectRpcCaller' {
	import * as rpc from '@micro-fleet/service-communication/dist/app/RpcCommon';
	export interface IDirectRpcCaller extends rpc.IRpcCaller {
	    /**
	     * IP address or host name including port number.
	     * Do not include protocol (http, ftp...) because different class implementations
	     * will prepend different protocols.
	     */
	    baseAddress: string;
	}
	export class HttpRpcCaller extends rpc.RpcCallerBase implements IDirectRpcCaller {
	    	    	    constructor();
	    baseAddress: string;
	    /**
	     * @see IRpcCaller.init
	     */
	    init(param?: any): void;
	    /**
	     * @see IRpcCaller.dispose
	     */
	    dispose(): Promise<void>;
	    /**
	     * @see IRpcCaller.call
	     */
	    call(moduleName: string, action: string, params?: any): Promise<rpc.IRpcResponse>;
	}

}
declare module '@micro-fleet/service-communication/dist/app/DirectRpcHandler' {
	/// <reference types="express" />
	import * as express from 'express';
	import { IDependencyContainer, ActionFactory } from '@micro-fleet/common-util';
	import * as rpc from '@micro-fleet/service-communication/dist/app/RpcCommon';
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
	export class ExpressRpcHandler extends rpc.RpcHandlerBase implements IDirectRpcHandler {
	    	    	    	    	    	    	    constructor(depContainer: IDependencyContainer);
	    port: number;
	    /**
	     * @see IDirectRpcHandler.init
	     */
	    init(param?: ExpressRpcHandlerInitOptions): void;
	    /**
	     * @see IRpcHandler.start
	     */
	    start(): Promise<void>;
	    /**
	     * @see IRpcHandler.dispose
	     */
	    dispose(): Promise<void>;
	    /**
	     * @see IRpcHandler.handle
	     */
	    handle(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): void;
	    	}

}
declare module '@micro-fleet/service-communication/dist/app/DirectRpcHandlerAddOnBase' {
	import { IConfigurationProvider } from '@micro-fleet/common-contracts';
	import { IDirectRpcHandler } from '@micro-fleet/service-communication/dist/app/DirectRpcHandler';
	/**
	 * Base class for DirectRpcAddOn.
	 */
	export abstract class DirectRpcHandlerAddOnBase implements IServiceAddOn {
	    protected _configProvider: IConfigurationProvider;
	    protected _rpcHandler: IDirectRpcHandler;
	    constructor(_configProvider: IConfigurationProvider, _rpcHandler: IDirectRpcHandler);
	    /**
	     * @see IServiceAddOn.init
	     */
	    init(moduleName?: string): Promise<void>;
	    /**
	     * @see IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @see IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	    protected handleRequests(): void;
	}

}
declare module '@micro-fleet/service-communication/dist/app/Types' {
	export class Types {
	    static readonly BROKER_ADDON: string;
	    static readonly DIRECT_RPC_CALLER: string;
	    static readonly DIRECT_RPC_HANDLER: string;
	    static readonly MEDIATE_RPC_CALLER: string;
	    static readonly MEDIATE_RPC_HANDLER: string;
	    static readonly MSG_BROKER_CONNECTOR: string;
	}

}
declare module '@micro-fleet/service-communication/dist/app/MessageBrokerConnector' {
	import * as amqp from 'amqplib';
	export type MessageHandleFunction = (msg: IMessage, ack?: () => void, nack?: () => void) => void;
	export interface IMessage {
	    data: any;
	    raw: amqp.Message;
	    properties?: IPublishOptions;
	}
	export interface IPublishOptions {
	    contentType?: 'text/plain' | 'application/json';
	    contentEncoding?: string;
	    correlationId?: string;
	    replyTo?: string;
	}
	export interface IConnectionOptions {
	    /**
	     * IP address or host name where message broker is located.
	     */
	    hostAddress: string;
	    /**
	     * Username to login to message broker.
	     */
	    username: string;
	    /**
	     * Password to login to message broker.
	     */
	    password: string;
	    /**
	     * Exchange name
	     */
	    exchange: string;
	    /**
	     * Milliseconds to wait before trying to reconnect to message broker.
	     */
	    reconnectDelay?: number;
	    /**
	     * The default queue name to bind.
	     * If not specified or given falsey values (empty string, null,...), a queue with random name will be created.
	     * IMessageBrokerConnector's implementation may allow connecting to many queues.
	     * But each TopicMessageBrokerConnector instance connects to only one queue.
	     */
	    queue?: string;
	    /**
	     * Milliseconds to expire messages arriving in the queue.
	     */
	    messageExpiredIn?: number;
	}
	export interface IMessageBrokerConnector {
	    /**
	     * Gets or sets queue name.
	     * Queue can only be changed before it is bound.
	     * Queue is bound on the first call to `subscribe()` method.
	     * @throws Error if changing queue after it is bound.
	     */
	    queue: string;
	    /**
	     * Gets or sets milliseconds to expire messages arriving in the queue.
	     * Can only be changed before queue is bound.
	     * Queue is bound on the first call to `subscribe()` method.
	     * @throws Error if changing queue after it is bound.
	     */
	    messageExpiredIn: number;
	    /**
	     * Gets array of subscribed matching patterns.
	     */
	    readonly subscribedPatterns: string[];
	    /**
	     * Creates a connection to message broker engine.
	     * @param {IConnectionOptions} options
	     */
	    connect(options: IConnectionOptions): Promise<void>;
	    /**
	     * Closes all channels and the connection.
	     */
	    disconnect(): Promise<void>;
	    /**
	     * Deletes queue.
	     */
	    deleteQueue(): Promise<void>;
	    /**
	     * Deletes all messages in queue.
	     * Note that this won't remove messages that have been delivered but not yet acknowledged.
	     * They will remain, and may be requeued under some circumstances
	     * (e.g., if the channel to which they were delivered closes without acknowledging them).
	     *
	     * @returns Number of deleted message.
	     */
	    emptyQueue(): Promise<number>;
	    /**
	     * Starts receiving messages.
	     * @param {function} onMessage - Callback to invoke when there is an incomming message.
	     * @param {boolean} noAck - If true, received message is acknowledged automatically.
	     * 	Default should be `true`.
	     */
	    listen(onMessage: MessageHandleFunction, noAck?: boolean): Promise<void>;
	    /**
	     * Stops receiving messages.
	     */
	    stopListen(): Promise<void>;
	    /**
	     * Sends `message` to the broker and label the message with `topic`.
	     * @param {string} topic - A name to label the message with. Should be in format "xxx.yyy.zzz".
	     * @param {any} payload - A message to send to broker.
	     * @param {IPublishOptions} options - Options to add to message properties.
	     */
	    publish(topic: string, payload: any, options?: IPublishOptions): Promise<void>;
	    /**
	     * Listens to messages whose label matches `matchingPattern`.
	     * @param {string} matchingPattern - Pattern to match with message label. Should be in format "xx.*" or "xx.#.#".
	     */
	    subscribe(matchingPattern: string): Promise<void>;
	    /**
	     * Stops listening to a topic pattern.
	     */
	    unsubscribe(matchingPattern: string): Promise<void>;
	    /**
	     * Stops listening to all subscriptions.
	     */
	    unsubscribeAll(): Promise<void>;
	    /**
	     * Registers a listener to handle errors.
	     */
	    onError(handler: (err) => void): void;
	}
	export class TopicMessageBrokerConnector implements IMessageBrokerConnector {
	    	    	    	    	    	    	    	    	    	    	    	    	    	    constructor();
	    /**
	     * @see IMessageBrokerConnector.queue
	     */
	    /**
	     * @see IMessageBrokerConnector.queue
	     */
	    queue: string;
	    /**
	     * @see IMessageBrokerConnector.messageExpiredIn
	     */
	    /**
	     * @see IMessageBrokerConnector.messageExpiredIn
	     */
	    messageExpiredIn: number;
	    /**
	     * @see IMessageBrokerConnector.subscribedPatterns
	     */
	    readonly subscribedPatterns: string[];
	    	    /**
	     * @see IMessageBrokerConnector.connect
	     */
	    connect(options: IConnectionOptions): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.disconnect
	     */
	    disconnect(): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.deleteQueue
	     */
	    deleteQueue(): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.emptyQueue
	     */
	    emptyQueue(): Promise<number>;
	    /**
	     * @see IMessageBrokerConnector.listen
	     */
	    listen(onMessage: MessageHandleFunction, noAck?: boolean): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.stopListen
	     */
	    stopListen(): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.publish
	     */
	    publish(topic: string, payload: any, options?: IPublishOptions): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.subscribe
	     */
	    subscribe(matchingPattern: string): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.unsubscribe
	     */
	    unsubscribe(matchingPattern: string): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.unsubscribeAll
	     */
	    unsubscribeAll(): Promise<void>;
	    /**
	     * @see IMessageBrokerConnector.onError
	     */
	    onError(handler: (err) => void): void;
	    	    	    	    	    	    	    	    	    	    	    	    	    	    	}

}
declare module '@micro-fleet/service-communication/dist/app/MediateRpcCaller' {
	import { IMessageBrokerConnector } from '@micro-fleet/service-communication/dist/app/MessageBrokerConnector';
	import * as rpc from '@micro-fleet/service-communication/dist/app/RpcCommon';
	export interface IMediateRpcCaller extends rpc.IRpcCaller {
	}
	export class MessageBrokerRpcCaller extends rpc.RpcCallerBase implements IMediateRpcCaller {
	    	    constructor(_msgBrokerConn: IMessageBrokerConnector);
	    /**
	     * @see IRpcCaller.init
	     */
	    init(params?: any): void;
	    /**
	     * @see IRpcCaller.dispose
	     */
	    dispose(): Promise<void>;
	    /**
	     * @see IRpcCaller.call
	     */
	    call(moduleName: string, action: string, params?: any): Promise<rpc.IRpcResponse>;
	}

}
declare module '@micro-fleet/service-communication/dist/app/MediateRpcHandler' {
	import { IDependencyContainer, ActionFactory } from '@micro-fleet/common-util';
	import { IMessageBrokerConnector } from '@micro-fleet/service-communication/dist/app/MessageBrokerConnector';
	import * as rpc from '@micro-fleet/service-communication/dist/app/RpcCommon';
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
	export class MessageBrokerRpcHandler extends rpc.RpcHandlerBase implements IMediateRpcHandler {
	    	    	    constructor(depContainer: IDependencyContainer, _msgBrokerConn: IMessageBrokerConnector);
	    /**
	     * @see IRpcHandler.init
	     */
	    init(params?: any): void;
	    /**
	     * @see IRpcHandler.start
	     */
	    start(): Promise<void>;
	    /**
	     * @see IRpcHandler.dispose
	     */
	    dispose(): Promise<void>;
	    /**
	     * @see IMediateRpcHandler.handle
	     */
	    handle(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Promise<void>;
	    /**
	     * @see IMediateRpcHandler.handleCRUD
	     */
	    handleCRUD(dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Promise<void>;
	    	}

}
declare module '@micro-fleet/service-communication/dist/app/MediateRpcHandlerAddOnBase' {
	import { IConfigurationProvider } from '@micro-fleet/common-contracts';
	import { IMediateRpcHandler } from '@micro-fleet/service-communication/dist/app/MediateRpcHandler';
	/**
	 * Base class for MediateRpcAddOn.
	 */
	export abstract class MediateRpcHandlerAddOnBase implements IServiceAddOn {
	    protected _configProvider: IConfigurationProvider;
	    protected _rpcHandler: IMediateRpcHandler;
	    protected abstract controllerIdentifier: string | symbol;
	    constructor(_configProvider: IConfigurationProvider, _rpcHandler: IMediateRpcHandler);
	    /**
	     * @see IServiceAddOn.init
	     */
	    init(moduleName?: string): Promise<void>;
	    /**
	     * @see IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @see IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	    protected handleRequests(): void;
	}

}
declare module '@micro-fleet/service-communication/dist/app/MessageBrokerAddOn' {
	import { IConfigurationProvider } from '@micro-fleet/common-contracts';
	import { IMessageBrokerConnector } from '@micro-fleet/service-communication/dist/app/MessageBrokerConnector';
	export class MessageBrokerAddOn implements IServiceAddOn {
	    	    	    constructor(_configProvider: IConfigurationProvider, _msgBrokerCnn: IMessageBrokerConnector);
	    /**
	     * @see IServiceAddOn.init
	     */
	    init(): Promise<void>;
	    /**
	     * @see IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @see IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	}

}
declare module '@micro-fleet/service-communication' {
	export * from '@micro-fleet/service-communication/dist/app/RpcCommon';
	export * from '@micro-fleet/service-communication/dist/app/DirectRpcCaller';
	export * from '@micro-fleet/service-communication/dist/app/DirectRpcHandler';
	export * from '@micro-fleet/service-communication/dist/app/DirectRpcHandlerAddOnBase';
	export * from '@micro-fleet/service-communication/dist/app/MediateRpcCaller';
	export * from '@micro-fleet/service-communication/dist/app/MediateRpcHandler';
	export * from '@micro-fleet/service-communication/dist/app/MediateRpcHandlerAddOnBase';
	export * from '@micro-fleet/service-communication/dist/app/MessageBrokerAddOn';
	export * from '@micro-fleet/service-communication/dist/app/MessageBrokerConnector';
	export * from '@micro-fleet/service-communication/dist/app/Types';

}
