"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const back_lib_common_constants_1 = require("back-lib-common-constants");
const back_lib_common_contracts_1 = require("back-lib-common-contracts");
const back_lib_common_util_1 = require("back-lib-common-util");
const CacheProvider_1 = require("./CacheProvider");
const Types_1 = require("./Types");
let CacheAddOn = class CacheAddOn {
    constructor(_configProvider, _depContainer) {
        this._configProvider = _configProvider;
        this._depContainer = _depContainer;
        back_lib_common_util_1.Guard.assertArgDefined('_configProvider', _configProvider);
        back_lib_common_util_1.Guard.assertArgDefined('_depContainer', _depContainer);
    }
    /**
     * @see IServiceAddOn.init
     */
    init() {
        let conns = back_lib_common_contracts_1.CacheSettings.fromProvider(this._configProvider);
        if (!conns || !conns.length) {
            return Promise.resolve();
        }
        let opts = {
            name: this._configProvider.get(back_lib_common_constants_1.SvcSettingKeys.SERVICE_SLUG)
        };
        if (conns.length == 1) {
            opts.single = conns[0];
        }
        else {
            opts.cluster = conns;
        }
        this._cacheProvider = new CacheProvider_1.CacheProvider(opts);
        this._depContainer.bindConstant(Types_1.Types.CACHE_PROVIDER, this._cacheProvider);
        return Promise.resolve();
    }
    /**
     * @see IServiceAddOn.deadLetter
     */
    deadLetter() {
        return Promise.resolve();
    }
    /**
     * @see IServiceAddOn.dispose
     */
    dispose() {
        return (this._cacheProvider) ? this._cacheProvider.dispose() : Promise.resolve();
    }
};
CacheAddOn = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.inject(back_lib_common_contracts_1.Types.CONFIG_PROVIDER)),
    __param(1, back_lib_common_util_1.inject(back_lib_common_util_1.Types.DEPENDENCY_CONTAINER)),
    __metadata("design:paramtypes", [Object, Object])
], CacheAddOn);
exports.CacheAddOn = CacheAddOn;

//# sourceMappingURL=CacheAddOn.js.map
