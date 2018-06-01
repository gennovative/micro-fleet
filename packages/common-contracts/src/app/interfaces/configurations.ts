import { SettingItemDataType } from '../models/settings/SettingItem';

/**
 * Stores a database connection detail.
 */
export interface IDbConnectionDetail {
	/**
	 * Database driver name, should use constants in class DbClient. 
	 * Eg: DbClient.SQLITE3, DbClient.POSTGRESQL, ...
	 */
	clientName: string;

	/**
	 * Connection string for specified `clientName`.
	 */
	connectionString?: string;

	/**
	 * Absolute path to database file name.
	 */
	filePath?: string;

	host?: {
		/**
		 * IP Address or Host name.
		 */
		address: string,

		/**
		 * Username to login database.
		 */
		user: string,

		/**
		 * Password to login database.
		 */
		password: string,

		/**
		 * Database name.
		 */
		database: string
	};
}

export interface ICacheConnectionDetail {
	/**
		 * Address of remote cache service.
		 */
	host?: string;

	/**
	 * Port of remote cache service.
	 */
	port?: number;
}

export interface IConfigurationProvider extends IServiceAddOn {
	/**
	 * Turns on or off remote settings fetching.
	 */
	enableRemote: boolean;

	/**
	 * Attempts to get settings from cached Configuration Service, environmetal variable,
	 * and `appconfig.json` file, respectedly.
	 * @param {string} key Setting key
	 * @param {SettingItemDataType} dataType Data type to parse some settings from file or ENV variables.
	 * 		Has no effect with remote settings.
	 */
	get(key: string, dataType?: SettingItemDataType): number & boolean & string;

	/**
	 * Attempts to fetch settings from remote Configuration Service.
	 */
	fetch(): Promise<boolean>;

	/**
	 * Invokes everytime new settings are updated.
	 * The callback receives an array of changed setting keys.
	 */
	onUpdate(listener: (changedKeys: string[]) => void): void;
}