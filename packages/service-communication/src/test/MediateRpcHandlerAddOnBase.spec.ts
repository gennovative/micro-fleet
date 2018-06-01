import * as chai from 'chai';
import * as spies from 'chai-spies';

import { IConfigurationProvider, Types as ConT, constants } from '@micro-fleet/common-contracts';
import { injectable, inject, Guard, DependencyContainer } from '@micro-fleet/common-util';
import { IMediateRpcHandler, IRpcRequest, IMessageBrokerConnector,
	IConnectionOptions, IPublishOptions, MessageHandleFunction,
	MediateRpcHandlerAddOnBase, MessageBrokerRpcHandler,
	Types as ComT } from '../app';

const { RpcSettingKeys: RpcS, SvcSettingKeys: SvcS } = constants;

chai.use(spies);
const expect = chai.expect;


const SERVICE_SLUG = 'test-service',
	MODULE_NAME = 'testModule';


class MockConfigProvider implements IConfigurationProvider {
	
	get enableRemote(): boolean {
		return true;
	}

	public init(): Promise<void> {
		return Promise.resolve();
	}

	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public onUpdate(listener: (changedKeys: string[]) => void) {

	}

	public get(key: string): number & boolean & string {
		switch (key) {
			case SvcS.SERVICE_SLUG: return <any>SERVICE_SLUG;
			default: return null;
		}
	}

	public async fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}
}

class MockMbConnector implements IMessageBrokerConnector {
	public messageExpiredIn: number;
	public subscribedPatterns: string[];

	private _connections = [];

	public get queue(): string {
		return '';
	}

	public connect(options: IConnectionOptions): Promise<void> {
		return Promise.resolve();
	}
	
	public disconnect(): Promise<void> {
		return Promise.resolve();
	}
	
	public deleteQueue(): Promise<void> {
		return Promise.resolve();
	}
	
	public emptyQueue(): Promise<number> {
		return Promise.resolve(0);
	}

	public listen(onMessage: MessageHandleFunction, noAck?: boolean): Promise<void> {
		return Promise.resolve();
	}

	public stopListen(): Promise<void> {
		return Promise.resolve();
	}

	public publish(topic: string, payload: string | Json | JsonArray, options?: IPublishOptions): Promise<void> {
		return Promise.resolve();
	}

	public subscribe(matchingPattern: string): Promise<void> {
		return Promise.resolve();
	}

	public unsubscribe(consumerTag: string): Promise<void> {
		return Promise.resolve();
	}

	public unsubscribeAll(): Promise<void> {
		return Promise.resolve();
	}

	public onError(handler: (err) => void): void {
	}
}

class CustomController {
	public add(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
	}

	public remove(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
	}

	public echo(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
	}
}

@injectable()
class CustomAddOn extends MediateRpcHandlerAddOnBase {

	protected controllerIdentifier: string | symbol;

	constructor(
		@inject(ConT.CONFIG_PROVIDER) configProvider: IConfigurationProvider,
		@inject(ComT.MEDIATE_RPC_HANDLER) rpcHandler: IMediateRpcHandler
	) {
		super(configProvider, rpcHandler);
		this.controllerIdentifier = 'CustomController';
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		return super.init(MODULE_NAME);
	}

	/**
	 * @see IServiceAddOn.deadLetter
	 */
	public deadLetter(): Promise<void> {
		return super.deadLetter();
	}

	/**
	 * @see IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		return super.dispose();
	}

	/**
	 * @override
	 */
	protected handleRequests(): void {
		super.handleRequests();
		this._rpcHandler.handle('add', '');
	}
}


let connector: IMessageBrokerConnector,
	depContainer: DependencyContainer,
	handler: IMediateRpcHandler,
	addon: CustomAddOn;

describe('MediateRpcHandlerAddOnBase', () => {

	beforeEach(() => {
		connector = new MockMbConnector();
		depContainer = new DependencyContainer();
		handler = new MessageBrokerRpcHandler(depContainer, connector);
		addon = new CustomAddOn(new MockConfigProvider(), handler);
	});

	describe('init', () => {
		it('Should set RPC handler name and port', async () => {
			// Act
			await addon.init();

			// Assert
			expect(addon['_rpcHandler'].module).to.equal(MODULE_NAME);
			expect(addon['_rpcHandler'].name).to.equal(SERVICE_SLUG);
		});
	}); // END describe 'init'

	describe('dispose', () => {
		it('should call RPC handler.dispose', async () => {
			// Arrange
			let disconnectSpy = chai.spy.on(addon['_rpcHandler'], 'dispose');
			
			// Act
			await addon.dispose();

			// Assert
			expect(disconnectSpy).to.be.spy;
			expect(disconnectSpy).to.be.called.once;
		});
	}); // END describe 'dispose'
});