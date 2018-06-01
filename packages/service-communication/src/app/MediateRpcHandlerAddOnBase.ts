import { IConfigurationProvider, constants } from '@micro-fleet/common-contracts';
import { inject, injectable, unmanaged, Guard } from '@micro-fleet/common-util';

import { IMediateRpcHandler } from './MediateRpcHandler';

const { SvcSettingKeys: S } = constants;

/**
 * Base class for MediateRpcAddOn.
 */
@injectable()
export abstract class MediateRpcHandlerAddOnBase implements IServiceAddOn {

	protected abstract controllerIdentifier: string | symbol;

	constructor(
		@unmanaged() protected _configProvider: IConfigurationProvider,
		@unmanaged() protected _rpcHandler: IMediateRpcHandler
	) {
		Guard.assertArgDefined('_configProvider', _configProvider);
		Guard.assertArgDefined('_rpcHandler', _rpcHandler);
	}


	/**
	 * @see IServiceAddOn.init
	 */
	public init(moduleName: string = null): Promise<void> {
		this._rpcHandler.module = moduleName;
		this._rpcHandler.name = this._configProvider.get(S.SERVICE_SLUG);
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
		this._rpcHandler.handleCRUD(this.controllerIdentifier);
	}
}