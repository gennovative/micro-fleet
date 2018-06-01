"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SvcSettingKeys;
(function (SvcSettingKeys) {
    /**
     * Number of milliseconds to wait before actually stop addons.
     * Date type: number
     */
    SvcSettingKeys["ADDONS_DEADLETTER_TIMEOUT"] = "addons_deadletter_timeout";
    /**
     * Array of addresses to SettingService.
     * Data type: string[]
     */
    SvcSettingKeys["SETTINGS_SERVICE_ADDRESSES"] = "settings_service_addresses";
    /**
     * Array of addresses to IdGeneratorService.
     * Data type: string[]
     */
    SvcSettingKeys["ID_SERVICE_ADDRESSES"] = "id_service_addresses";
    /**
     * Number of milliseconds between refetchings.
     * Date type: number
     */
    SvcSettingKeys["SETTINGS_REFETCH_INTERVAL"] = "settings_refetch_interval";
    /**
     * Service URL-safe name.
     * Data type: string
     */
    SvcSettingKeys["SERVICE_SLUG"] = "service_slug";
})(SvcSettingKeys = exports.SvcSettingKeys || (exports.SvcSettingKeys = {}));

//# sourceMappingURL=service.js.map
