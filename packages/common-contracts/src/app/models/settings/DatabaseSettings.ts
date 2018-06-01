import { DbSettingKeys as S } from '../../constants/setting-keys/database';
import { IConfigurationProvider, IDbConnectionDetail } from '../../interfaces/configurations';
import { SettingItem, SettingItemDataType } from './SettingItem';


/**
 * Wraps an array of database settings.
 */
export class DatabaseSettings
	extends Array<SettingItem> {

	public static fromProvider(provider: IConfigurationProvider): IDbConnectionDetail[] {
		let nConn = <number>provider.get(S.DB_NUM_CONN),
			details = [],
			d;

		for (let i = 0; i < nConn; ++i) {
			d = this.buildConnDetails(i, provider);
			if (!d) { continue; }
			details.push(d);
		}
		return details.length ? details : null;
	}

	private static buildConnDetails(connIdx: number, provider: IConfigurationProvider): IDbConnectionDetail {
		let cnnDetail: IDbConnectionDetail = {
				clientName: provider.get(S.DB_ENGINE + connIdx) // Must belong to `DbClient`
			},
			value: string;

		// 1st priority: connect to a local file.
		value = provider.get(S.DB_FILE + connIdx);
		if (value) {
			cnnDetail.filePath = value;
			return cnnDetail;
		}

		// 2nd priority: connect with a connection string.
		value = provider.get(S.DB_CONN_STRING + connIdx);
		if (value) {
			cnnDetail.connectionString = value;
			return cnnDetail;
		}

		// Last priority: connect with host credentials.
		value = provider.get(S.DB_HOST + connIdx);
		if (value) {
			cnnDetail.host = {
				address: provider.get(S.DB_HOST + connIdx),
				user: provider.get(S.DB_USER + connIdx),
				password: provider.get(S.DB_PASSWORD + connIdx),
				database: provider.get(S.DB_NAME + connIdx),
			};
			return cnnDetail;
		}
		return null;
	}


	private _countSetting: SettingItem;

	constructor() {
		super();
		this._countSetting = SettingItem.translator.whole({
			name: S.DB_NUM_CONN,
			dataType: SettingItemDataType.Number,
			value: '0'
		});

		this.push(this._countSetting);
	}


	/**
	 * Gets number of connection settings.
	 */
	public get total(): number {
		return parseInt(this._countSetting.value);
	}

	/**
	 * Parses then adds connection detail to setting item array.
	 */
	public pushConnection(detail: IDbConnectionDetail) {
		let newIdx = parseInt(this._countSetting.value);

		this.push(SettingItem.translator.whole({
				name: S.DB_ENGINE + newIdx,
				dataType: SettingItemDataType.String,
				value: detail.clientName
			}));

		if (detail.host) {
			this.push(SettingItem.translator.whole({
					name: S.DB_HOST + newIdx,
					dataType: SettingItemDataType.String,
					value: detail.host.address
				}));
			this.push(SettingItem.translator.whole({
					name: S.DB_USER + newIdx,
					dataType: SettingItemDataType.String,
					value: detail.host.user
				}));
			this.push(SettingItem.translator.whole({
					name: S.DB_PASSWORD + newIdx,
					dataType: SettingItemDataType.String,
					value: detail.host.password
				}));
			this.push(SettingItem.translator.whole({
					name: S.DB_NAME + newIdx,
					dataType: SettingItemDataType.String,
					value: detail.host.database
				}));
		} else if (detail.filePath) {
			this.push(SettingItem.translator.whole({
					name: S.DB_FILE + newIdx,
					dataType: SettingItemDataType.String,
					value: detail.filePath
				}));
		} else {
			this.push(SettingItem.translator.whole(
				{
					name: S.DB_CONN_STRING + newIdx,
					dataType: SettingItemDataType.String,
					value: detail.connectionString
				}));
		}

		let setting: any = this._countSetting;
		setting.value = (newIdx + 1) + '';
	}
}