import { IConfigurationProvider, constants } from '@micro-fleet/common-contracts';
import { inject, injectable, unmanaged, Guard } from '@micro-fleet/common-util';

import { IDirectRpcHandler } from './DirectRpcHandler';

const { RpcSettingKeys: RpcS, SvcSettingKeys: SvcS } = constants;


/**
 * Base class for DirectRpcAddOn.
 */
@injectable()
export abstract class DirectRpcHandlerAddOnBase implements IServiceAddOn {

	constructor(
		@unmanaged() protected _configProvider: IConfigurationProvider,
		@unmanaged() protected _rpcHandler: IDirectRpcHandler
	) {
		Guard.assertArgDefined('_configProvider', _configProvider);
		Guard.assertArgDefined('_rpcHandler', _rpcHandler);
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(moduleName: string = null): Promise<void> {
		this._rpcHandler.module = moduleName;
		this._rpcHandler.name = this._configProvider.get(SvcS.SERVICE_SLUG);
		this._rpcHandler.port = this._configProvider.get(RpcS.RPC_HANDLER_PORT);
		this._rpcHandler.init();
		this.handleRequests();
		return this._rpcHandler.start();
	}

	/**
	 * @see IServiceAddOn.deadLetter
	 */
	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * @see IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		this._configProvider = null;
		let handler = this._rpcHandler;
		this._rpcHandler = null;
		return handler.dispose();
	}


	protected handleRequests(): void {
	}
}