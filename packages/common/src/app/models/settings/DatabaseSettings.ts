import { DbSettingKeys as S } from '../../constants/setting-keys/database';
// import { DbClient } from '../../constants/DbClient';
import { /*IConfigurationProvider,*/ DbConnectionDetail } from '../../interfaces/configurations';
import { Maybe } from '../Maybe';
import { SettingItem, SettingItemDataType } from './SettingItem';


/**
 * Represents an array of database settings.
 */
export class DatabaseSettings
	extends Array<SettingItem> {

	/**
	 * Parses from configuration provider.
	 * @param {IConfigurationProvider} provider.
	 */
	/*
	public static fromProvider(provider: IConfigurationProvider): Maybe<DbConnectionDetail> {
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
	//*/

	/**
	 * Parses from connection detail.
	 * @param {DbConnectionDetail} detail Connection detail loaded from JSON data source.
	 */
	public static fromConnectionDetail(detail: DbConnectionDetail): Maybe<DatabaseSettings> {
		const settings = new DatabaseSettings;
		
		if (detail.clientName) {
			settings.push(SettingItem.translator.whole({
				name: S.DB_ENGINE,
				dataType: SettingItemDataType.String,
				value: detail.clientName
			}));
		} else {
			return new Maybe;
		}

		if (detail.filePath) {
			settings.push(SettingItem.translator.whole({
				name: S.DB_FILE,
				dataType: SettingItemDataType.String,
				value: detail.filePath
			}));
		} else if (detail.connectionString) {
			settings.push(SettingItem.translator.whole(
				{
					name: S.DB_CONN_STRING,
					dataType: SettingItemDataType.String,
					value: detail.connectionString
				}));
		} else if (detail.host) {
			settings.push(SettingItem.translator.whole({
				name: S.DB_ADDRESS,
				dataType: SettingItemDataType.String,
				value: detail.host.address
			}));
			settings.push(SettingItem.translator.whole({
				name: S.DB_USER,
				dataType: SettingItemDataType.String,
				value: detail.host.user
			}));
			settings.push(SettingItem.translator.whole({
				name: S.DB_PASSWORD,
				dataType: SettingItemDataType.String,
				value: detail.host.password
			}));
			settings.push(SettingItem.translator.whole({
				name: S.DB_NAME,
				dataType: SettingItemDataType.String,
				value: detail.host.database
			}));
		} else {
			return new Maybe;
		}
		return settings.length ? new Maybe(settings) : new Maybe;
	}

	constructor() {
		super();
	}
}