import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as _ from 'lodash';

import { IConfigurationProvider, SettingItemDataType, constants } from '@micro-fleet/common-contracts';
import { IDirectRpcCaller, IRpcResponse, Types as ComT } from '@micro-fleet/service-communication';

import { IdProvider } from '../app';

chai.use(spies);

const { SvcSettingKeys: S, ModuleNames: M, ActionNames: A } = constants;
const expect = chai.expect,
	SVC_SLUG = 'test-svc',
	ID_SVC_ADDR = ['192.168.1.1', '192.168.1.2'];

class MockConfigAddOn implements IConfigurationProvider {

	get enableRemote(): boolean {
		return true;
	}

	public get(key: string, type?: SettingItemDataType): number & boolean & string {
		switch (key) {
			case S.SERVICE_SLUG: return <any>SVC_SLUG;
			case S.ID_SERVICE_ADDRESSES: return <any>ID_SVC_ADDR;
			default: return null;
		}
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

class MockDirectRpcCaller implements IDirectRpcCaller {
	public baseAddress: string;
	public name: string;
	public timeout: number;

	public init(params?: any): any {
	}

	public dispose(): Promise<void> {
		return Promise.resolve();
	}

	public onError(handler: (err) => void): void {
	}

	public call(moduleName: string, action: string, params?: any): Promise<IRpcResponse> {
		return Promise.resolve(null);
	}

}

let idProd: IdProvider;

describe('IdProvider', () => {

	beforeEach(() => {
		idProd = new IdProvider(new MockConfigAddOn(), new MockDirectRpcCaller());
		return idProd.init();
	});

	describe('init', () => {
		it('should init RPC caller', async () => {
			// Arrange
			let idProd = new IdProvider(new MockConfigAddOn(), new MockDirectRpcCaller());

			// Act
			await idProd.init();

			// Assert
			expect(idProd['_rpcCaller'].name).to.equal(SVC_SLUG);
			expect(idProd['_addresses']).to.equal(ID_SVC_ADDR);
		});
	}); // describe 'init'

	describe('dispose', () => {
		it('should release all resources', async () => {
			// Arrange
			let disposeSpy = chai.spy.on(idProd['_rpcCaller'], 'dispose');

			// Act
			await idProd.dispose();

			// Assert
			
			expect(disposeSpy).to.be.called;
		});
	}); // describe 'dispose'

	describe('nextBigInt', () => {
		it('should return a big int string', async () => {
			// Act
			let id = idProd.nextBigInt();

			// Assert
			console.log('Big Int: ', id);
			expect(id).to.be.string;
			expect(id).not.to.be.empty;
		});
	}); // describe 'nextBigInt'

	describe('nextShortId', () => {
		it('should return a short ID string', async () => {
			// Act
			let id = idProd.nextShortId();

			// Assert
			console.log('Short ID: ', id);
			expect(id).to.be.string;
			expect(id).not.to.be.empty;
		});
	}); // describe 'nextShortId'

	describe('nextUuidv4', () => {
		it('should return a version-4 UUID string', async () => {
			// Act
			let id = idProd.nextUuidv4();

			// Assert
			console.log('UUID V6: ', id);
			expect(id).to.be.string;
			expect(id).not.to.be.empty;
		});
	}); // describe 'nextUuidv4'
});