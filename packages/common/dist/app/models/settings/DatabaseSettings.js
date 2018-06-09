"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../constants/setting-keys/database");
const Maybe_1 = require("../Maybe");
const SettingItem_1 = require("./SettingItem");
/**
 * Represents an array of database settings.
 */
class DatabaseSettings extends Array {
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
    static fromConnectionDetail(detail) {
        const settings = new DatabaseSettings;
        if (detail.clientName) {
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_ENGINE,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.clientName
            }));
        }
        else {
            return new Maybe_1.Maybe;
        }
        if (detail.filePath) {
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_FILE,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.filePath
            }));
        }
        else if (detail.connectionString) {
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_CONN_STRING,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.connectionString
            }));
        }
        else if (detail.host) {
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_ADDRESS,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.address
            }));
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_USER,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.user
            }));
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_PASSWORD,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.password
            }));
            settings.push(SettingItem_1.SettingItem.translator.whole({
                name: database_1.DbSettingKeys.DB_NAME,
                dataType: SettingItem_1.SettingItemDataType.String,
                value: detail.host.database
            }));
        }
        else {
            return new Maybe_1.Maybe;
        }
        return settings.length ? new Maybe_1.Maybe(settings) : new Maybe_1.Maybe;
    }
    constructor() {
        super();
    }
}
exports.DatabaseSettings = DatabaseSettings;
//# sourceMappingURL=DatabaseSettings.js.map