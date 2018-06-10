import { IConfigurationProvider, Types as ConT, constants, injectable,
	inject, Guard } from '@micro-fleet/common';

import { IMessageBrokerConnector, IConnectionOptions} from './MessageBrokerConnector';
import { Types as T } from './Types';

const { MbSettingKeys: S } = constants;


@injectable()
export class MessageBrokerAddOn implements IServiceAddOn {

	constructor(
		@inject(ConT.CONFIG_PROVIDER) private _configProvider: IConfigurationProvider,
		@inject(T.MSG_BROKER_CONNECTOR) private _msgBrokerCnn: IMessageBrokerConnector
	) {
		Guard.assertArgDefined('_configProvider', _configProvider);
		Guard.assertArgDefined('_msgBrokerCnn', _msgBrokerCnn);
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		let cfgAdt = this._configProvider,
			opts: IConnectionOptions = {
				hostAddress: cfgAdt.get(S.MSG_BROKER_HOST).value as string,
				username: cfgAdt.get(S.MSG_BROKER_USERNAME).value as string,
				password: cfgAdt.get(S.MSG_BROKER_PASSWORD).value as string,
				exchange: cfgAdt.get(S.MSG_BROKER_EXCHANGE).value as string,
				queue: cfgAdt.get(S.MSG_BROKER_QUEUE).value as string,
				reconnectDelay: cfgAdt.get(S.MSG_BROKER_RECONN_TIMEOUT).value as number,
				messageExpiredIn: cfgAdt.get(S.MSG_BROKER_RECONN_TIMEOUT).value as number,
			};
		return this._msgBrokerCnn.connect(opts);
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
		return this._msgBrokerCnn.disconnect();
	}
}