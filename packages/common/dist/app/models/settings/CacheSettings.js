"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../../constants/setting-keys/cache");
// import { Maybe } from '../Maybe';
const SettingItem_1 = require("./SettingItem");
/**
 * Represents an array of cache settings.
 */
class CacheSettings extends Array {
    constructor() {
        super();
        this._numSetting = SettingItem_1.SettingItem.translator.whole({
            name: cache_1.CacheSettingKeys.CACHE_NUM_CONN,
            dataType: SettingItem_1.SettingItemDataType.Number,
            value: '0'
        });
        this.push(this._numSetting);
    }
    /**
     * Gets number of connection settings.
     */
    get total() {
        return parseInt(this._numSetting.value);
    }
    /**
     * Parses then adds a server detail to setting item array.
     */
    pushServer(detail) {
        let newIdx = parseInt(this._numSetting.value);
        this.push(SettingItem_1.SettingItem.translator.whole({
            name: cache_1.CacheSettingKeys.CACHE_HOST + newIdx,
            dataType: SettingItem_1.SettingItemDataType.String,
            value: detail.host
        }));
        this.push(SettingItem_1.SettingItem.translator.whole({
            name: cache_1.CacheSettingKeys.CACHE_PORT + newIdx,
            dataType: SettingItem_1.SettingItemDataType.Number,
            value: detail.port + ''
        }));
        let setting = this._numSetting;
        setting.value = (newIdx + 1) + '';
    }
}
exports.CacheSettings = CacheSettings;
//# sourceMappingURL=CacheSettings.js.map