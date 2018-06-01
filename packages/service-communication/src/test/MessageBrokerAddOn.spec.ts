import * as chai from 'chai';
import * as spies from 'chai-spies';

import { IConfigurationProvider, constants } from '@micro-fleet/common-contracts';

import { IMessageBrokerConnector, IConnectionOptions, IPublishOptions,
	MessageHandleFunction, MessageBrokerAddOn } from '../app';

const { MbSettingKeys: S } = constants;


chai.use(spies);
const expect = chai.expect;


class MockConfigAddOn implements IConfigurationProvider {

	get enableRemote(): boolean {
		return true;
	}

	public get(key: string): number & boolean & string {
		return <any>'';
	}

	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	public fetch(): Promise<boolean> {
		return Promise.resolve(true);
	}

	public init(): Promise<void> {
		return Promise.resolve();
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public onUpdate(listener: (delta: string[]) => void) {
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


describe('MessageBrokerAddOn', () => {
	describe('init', () => {
		it('should call connector.connect', async () => {
			// Arrange
			let dbAddOn = new MessageBrokerAddOn(new MockConfigAddOn(), new MockMbConnector()),
				connectSpy = chai.spy.on(dbAddOn['_msgBrokerCnn'], 'connect');
			
			// Act
			await dbAddOn.init();

			// Assert
			expect(connectSpy).to.be.spy;
			expect(connectSpy).to.have.been.called.once;
		});
	}); // END describe 'init'

	describe('dispose', () => {
		it('should call connector.disconnect', async () => {
			// Arrange
			let dbAddOn = new MessageBrokerAddOn(new MockConfigAddOn(), new MockMbConnector()),
				disconnectSpy = chai.spy.on(dbAddOn['_msgBrokerCnn'], 'disconnect');
			
			// Act
			await dbAddOn.dispose();

			// Assert
			expect(disconnectSpy).to.be.spy;
			expect(disconnectSpy).to.have.been.called.once;
		});
	}); // END describe 'dispose'
});