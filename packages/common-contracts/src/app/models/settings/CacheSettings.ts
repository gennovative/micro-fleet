import { CacheSettingKeys as S } from '../../constants/setting-keys/cache';
import { IConfigurationProvider, ICacheConnectionDetail } from '../../interfaces/configurations';
import { SettingItem, SettingItemDataType } from './SettingItem';

/**
 * Wraps an array of database settings.
 */
export class CacheSettings
	extends Array<SettingItem> {

	public static fromProvider(provider: IConfigurationProvider): ICacheConnectionDetail[] {
		let nConn = <number>provider.get(S.CACHE_NUM_CONN),
			details: ICacheConnectionDetail[] = [],
			d;

		for (let i = 0; i < nConn; ++i) {
			details.push({
				host: provider.get(S.CACHE_HOST + i),
				port: provider.get(S.CACHE_PORT + i)
			});
		}
		return details.length ? details : null;
	}


	private _numSetting: SettingItem;

	constructor() {
		super();
		this._numSetting = SettingItem.translator.whole({
			name: S.CACHE_NUM_CONN,
			dataType: SettingItemDataType.Number,
			value: '0'
		});

		this.push(this._numSetting);
	}


	/**
	 * Gets number of connection settings.
	 */
	public get total(): number {
		return parseInt(this._numSetting.value);
	}

	/**
	 * Parses then adds connection detail to setting item array.
	 */
	public pushConnection(detail: ICacheConnectionDetail) {
		let newIdx = parseInt(this._numSetting.value);

		this.push(SettingItem.translator.whole({
				name: S.CACHE_HOST + newIdx,
				dataType: SettingItemDataType.String,
				value: detail.host
			}));
		this.push(SettingItem.translator.whole({
				name: S.CACHE_PORT + newIdx,
				dataType: SettingItemDataType.Number,
				value: detail.port + ''
			}));

		let setting: any = this._numSetting;
		setting.value = (newIdx + 1) + '';
	}
}