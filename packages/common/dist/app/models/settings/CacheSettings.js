"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../../constants/setting-keys/cache");
const SettingItem_1 = require("./SettingItem");
class CacheSettings extends Array {
    static fromProvider(provider) {
        let nConn = provider.get(cache_1.CacheSettingKeys.CACHE_NUM_CONN), details = [];
        for (let i = 0; i < nConn; ++i) {
            details.push({
                host: provider.get(cache_1.CacheSettingKeys.CACHE_HOST + i),
                port: provider.get(cache_1.CacheSettingKeys.CACHE_PORT + i)
            });
        }
        return details.length ? details : null;
    }
    constructor() {
        super();
        this._numSetting = SettingItem_1.SettingItem.translator.whole({
            name: cache_1.CacheSettingKeys.CACHE_NUM_CONN,
            dataType: SettingItem_1.SettingItemDataType.Number,
            value: '0'
        });
        this.push(this._numSetting);
    }
    get total() {
        return parseInt(this._numSetting.value);
    }
    pushConnection(detail) {
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