import { CacheSettingKeys as S } from '../../constants/setting-keys/cache';
import { /*IConfigurationProvider,*/ CacheConnectionDetail } from '../../interfaces/configurations';
// import { Maybe } from '../Maybe';
import { SettingItem, SettingItemDataType } from './SettingItem';

/**
 * Represents an array of cache settings.
 */
export class CacheSettings
	extends Array<SettingItem> {

	/*
	public static fromProvider(provider: IConfigurationProvider): Maybe<CacheConnectionDetail[]> {
		let nConn = provider.get(S.CACHE_NUM_CONN) as Maybe<number>,
			details: CacheConnectionDetail[] = [];

		if (!nConn.hasValue) { return new Maybe; }
		for (let i = 0; i < nConn.value; ++i) {
			let host = provider.get(S.CACHE_HOST + i) as Maybe<string>,
				port = provider.get(S.CACHE_PORT + i) as Maybe<number>;

			if (!host.hasValue || !port.hasValue) { continue; }
			details.push({
				host: host.value,
				port: port.value
			});
		}
		return details.length ? new Maybe(details) : new Maybe;
	}
	//*/


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
	 * Parses then adds a server detail to setting item array.
	 */
	public pushServer(detail: CacheConnectionDetail) {
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