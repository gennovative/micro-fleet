import { SvcSettingKeys as Svc } from 'back-lib-common-constants';
import { IConfigurationProvider, CacheSettings, Types as ConT } from 'back-lib-common-contracts';
import { injectable, inject, Guard, IDependencyContainer, Types as CmT } from 'back-lib-common-util';

import { CacheProvider, CacheProviderConstructorOpts } from './CacheProvider';
import { Types as T } from './Types';


@injectable()
export class CacheAddOn implements IServiceAddOn {
	
	private _cacheProvider: CacheProvider;

	constructor(
		@inject(ConT.CONFIG_PROVIDER) private _configProvider: IConfigurationProvider,
		@inject(CmT.DEPENDENCY_CONTAINER) private _depContainer: IDependencyContainer,
	) {
		Guard.assertArgDefined('_configProvider', _configProvider);
		Guard.assertArgDefined('_depContainer', _depContainer);
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		let conns = CacheSettings.fromProvider(this._configProvider);
		if (!conns || !conns.length) { return Promise.resolve(); }

		let opts: CacheProviderConstructorOpts = {
				name: this._configProvider.get(Svc.SERVICE_SLUG)
			};

		if (conns.length == 1) {
			opts.single = conns[0];
		} else {
			opts.cluster = conns;
		}

		this._cacheProvider = new CacheProvider(opts);
		this._depContainer.bindConstant<CacheProvider>(T.CACHE_PROVIDER, this._cacheProvider);
		return Promise.resolve();
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
		return (this._cacheProvider) ? this._cacheProvider.dispose() : Promise.resolve();
	}
}