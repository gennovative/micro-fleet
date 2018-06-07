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
		let provider = this._configProvider;

		const clientName = provider.get(S.DB_ENGINE) as Maybe<DbClient>; // Must belong to `DbClient`
		if (!clientName.hasValue) { return new Maybe; }

		const cnnDetail: DbConnectionDetail = {
			clientName: clientName.value
		};
		let setting: Maybe<string>;

		// 1st priority: connect to a local file.
		setting = provider.get(S.DB_FILE) as Maybe<string>;
		if (setting.hasValue) {
			cnnDetail.filePath = setting.value;
			return new Maybe(cnnDetail);
		}

		// 2nd priority: connect with a connection string.
		setting = provider.get(S.DB_CONN_STRING) as Maybe<string>;
		if (setting.hasValue) {
			cnnDetail.connectionString = setting.value;
			return new Maybe(cnnDetail);
		}

		// Last priority: connect with host credentials.
		setting = provider.get(S.DB_NAME) as Maybe<string>;
		if (setting.hasValue) {
			cnnDetail.host = {
				address: provider.get(S.DB_ADDRESS).TryGetValue('localhost') as string,
				user: provider.get(S.DB_USER).TryGetValue('') as string,
				password: provider.get(S.DB_PASSWORD).TryGetValue('') as string,
				database: provider.get(S.DB_NAME).TryGetValue('') as string,
			};
			return new Maybe(cnnDetail);
		}
		return new Maybe;
	}
}