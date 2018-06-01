import { IConfigurationProvider, IDbConnectionDetail, Types as ConT, constants } from '@micro-fleet/common-contracts';
import { injectable, inject, Guard, CriticalException } from '@micro-fleet/common-util';

import { IDatabaseConnector } from './connector/IDatabaseConnector';
import { Types as T } from './Types';

const { DbSettingKeys: S } = constants;

/**
 * Initializes database connections.
 */
@injectable()
export class DatabaseAddOn implements IServiceAddOn {
	
	constructor(
		@inject(ConT.CONFIG_PROVIDER) private _configProvider: IConfigurationProvider,
		@inject(T.DB_CONNECTOR) private _dbConnector: IDatabaseConnector
	) {
		Guard.assertArgDefined('_configProvider', _configProvider);
		Guard.assertArgDefined('_dbConnector', _dbConnector);
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		this.addConnections();
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
	public async dispose(): Promise<void> {
		await this._dbConnector.dispose();
		this._dbConnector = null;
		this._configProvider = null;
	}


	private addConnections(): void {
		let connDetail;

		connDetail = this.buildConnDetails();
		if (connDetail) {
			this._dbConnector.init(connDetail);
		}

		if (!this._dbConnector.connection) {
			throw new CriticalException('No database settings!');
		}
	}

	private buildConnDetails(): IDbConnectionDetail {
		let provider = this._configProvider,
			cnnDetail: IDbConnectionDetail = {
				clientName: provider.get(S.DB_ENGINE) // Must belong to `DbClient`
			},
			value: string;

		// 1st priority: connect to a local file.
		value = provider.get(S.DB_FILE);
		if (value) {
			cnnDetail.filePath = value;
			return cnnDetail;
		}

		// 2nd priority: connect with a connection string.
		value = provider.get(S.DB_CONN_STRING);
		if (value) {
			cnnDetail.connectionString = value;
			return cnnDetail;
		}

		// Last priority: connect with host credentials.
		value = provider.get(S.DB_HOST);
		if (value) {
			cnnDetail.host = {
				address: provider.get(S.DB_HOST),
				user: provider.get(S.DB_USER),
				password: provider.get(S.DB_PASSWORD),
				database: provider.get(S.DB_NAME),
			};
			return cnnDetail;
		}
		return null;
	}
}