"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../constants/setting-keys/database");
const SettingItem_1 = require("./SettingItem");
/**
 * Wraps an array of database settings.
 */
class DatabaseSettings extends Array {
    static fromProvider(provider) {
        let nConn = provider.get(database_1.DbSettingKeys.DB_NUM_CONN), details = [], d;
        for (let i = 0; i < nConn; ++i) {
            d = this.buildConnDetails(i, provider);
            if (!d) {
                continue;
            }
            details.push(d);
        }
        return details.length ? details : null;
    }
    static buildConnDetails(connIdx, provider) {
        let cnnDetail = {
            clientName: provider.get(database_1.DbSettingKeys.DB_ENGINE + connIdx) // Must belong to `DbClient`
        }, value;
        // 1st priority: connect to a local file.
        value = provider.get(database_1.DbSettingKeys.DB_FILE + connIdx);
        if (value) {
            cnnDetail.filePath = value;
            return cnnDetail;
        }
        // 2nd priority: connect with a connection string.
        value = provider.get(database_1.DbSettingKeys.DB_CONN_STRING + connIdx);
        if (value) {
            cnnDetail.connectionString = value;
            return cnnDetail;
        }
        // Last priority: connect with host credentials.
        value = provider.get(database_1.DbSettingKeys.DB_HOST + connIdx);
        if (value) {
            cnnDetail.host = {
                address: provider.get(database_1.DbSettingKeys.DB_HOST + connIdx),
                user: provider.get(database_1.DbSettingKeys.DB_USER + connIdx),
                password: provider.get(database_1.DbSettingKeys.DB_PASSWORD + connIdx),
                database: provider.get(database_1.DbSettingKeys.DB_NAME + connIdx),
            };
            return cnnDetail;
        }
        return null;
    }
    constructor() {
        super();
        this._countSetting = SettingItem_1.SettingItem.translator.whole({
            name: database_1.DbSettingKeys.DB_NUM_CONN,
            dataType: SettingItem_1.SettingItemDataType.Number,
            value: '0'
        });
        this.push(this._countSetting);
    }
    /**
     * Gets number of connection settings.
     */
    get total() {
        return parseInt(this._countSetting.value);
    }
    /**
     * Parses then adds connection detail to setting item array.
     */
    pushConnection(detail) {
        let newIdx = parseInt(this._countSetting.value);
        this.push(SettingItem_1.SettingItem.translator.whole({
            name: database_1.DbSettingKeys.DB_ENGINE + newIdx,
            dataType: SettingItem_1.SettingItemDataType.String,
            value: detail.clientName
        }));
        if (detail.host) {
            this.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_HOST + newIdx,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.address
            }));
            this.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_USER + newIdx,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.user
            }));
            this.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_PASSWORD + newIdx,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.password
            }));
            this.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_NAME + newIdx,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.database
            }));
        }
        else if (detail.filePath) {
            this.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_FILE + newIdx,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.filePath
            }));
        }
        else {
            this.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_CONN_STRING + newIdx,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.connectionString
            }));
        }
        let setting = this._countSetting;
        setting.value = (newIdx + 1) + '';
    }
}
exports.DatabaseSettings = DatabaseSettings;

//# sourceMappingURL=DatabaseSettings.js.map
