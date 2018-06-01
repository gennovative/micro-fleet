"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CacheSettingKeys;
(function (CacheSettingKeys) {
    /**
     * Number of cache servers in cluster.
     * Data type: number
     */
    CacheSettingKeys["CACHE_NUM_CONN"] = "cache_num_conn";
    /**
     * IP or host name of cache service.
     * Must use with connection index: CACHE_HOST + '0', CACHE_HOST + '1'
     * Data type: string
     */
    CacheSettingKeys["CACHE_HOST"] = "cache_host_";
    /**
     * Port number.
     * Data type: number
     */
    CacheSettingKeys["CACHE_PORT"] = "db_port_";
})(CacheSettingKeys = exports.CacheSettingKeys || (exports.CacheSettingKeys = {}));

//# sourceMappingURL=cache.js.map
