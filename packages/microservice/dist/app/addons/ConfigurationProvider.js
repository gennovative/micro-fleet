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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const back_lib_common_constants_1 = require("back-lib-common-constants");
const back_lib_common_contracts_1 = require("back-lib-common-contracts");
const back_lib_common_util_1 = require("back-lib-common-util");
const back_lib_service_communication_1 = require("back-lib-service-communication");
/**
 * Provides settings from appconfig.json, environmental variables and remote settings service.
 */
let ConfigurationProvider = class ConfigurationProvider {
    constructor(_rpcCaller) {
        this._rpcCaller = _rpcCaller;
        back_lib_common_util_1.Guard.assertArgDefined('_rpcCaller', _rpcCaller);
        this._configFilePath = `${process.cwd()}/appconfig.json`;
        this._remoteSettings = this._fileSettings = {};
        this._enableRemote = false;
        this._eventEmitter = new events_1.EventEmitter();
        this._rpcCaller.name = 'ConfigurationProvider';
        this._isInit = false;
    }
    /**
     * @see IConfigurationProvider.enableRemote
     */
    get enableRemote() {
        return this._enableRemote;
    }
    /**
     * @see IConfigurationProvider.enableRemote
     */
    set enableRemote(val) {
        this._enableRemote = val;
    }
    get refetchInterval() {
        return this._refetchInterval;
    }
    set refetchInterval(val) {
        this._refetchInterval = val;
        if (this._refetchTimer) {
            this.stopRefetch();
            this.repeatFetch();
        }
    }
    /**
     * @see IServiceAddOn.init
     */
    init() {
        if (this._isInit) {
            return Promise.resolve();
        }
        this._isInit = true;
        try {
            this._fileSettings = require(this._configFilePath);
        }
        catch (ex) {
            console.warn(ex);
            this._fileSettings = {};
        }
        if (this.enableRemote) {
            let addresses = this.applySettings();
            if (!addresses) {
                return Promise.reject(new back_lib_common_util_1.CriticalException('No address for Settings Service!'));
            }
            this._addresses = addresses;
        }
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
        this.stopRefetch();
        this._configFilePath = null;
        this._fileSettings = null;
        this._remoteSettings = null;
        this._enableRemote = null;
        this._rpcCaller = null;
        this._eventEmitter = null;
        this._isInit = null;
        return Promise.resolve();
    }
    /**
     * @see IConfigurationProvider.get
     */
    get(key, dataType) {
        let value = this._remoteSettings[key];
        if (value === undefined && dataType) {
            value = this.parseValue(process.env[key] || this._fileSettings[key], dataType);
        }
        else if (value === undefined) {
            value = process.env[key] || this._fileSettings[key];
        }
        return (value ? value : null);
    }
    /**
     * @see IConfigurationProvider.fetch
     */
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            let addresses = this._addresses, oldSettings = this._remoteSettings;
            for (let addr of addresses) {
                if (yield this.attemptFetch(addr)) {
                    // Move this address onto top of list
                    let pos = addresses.indexOf(addr);
                    if (pos != 0) {
                        addresses.splice(pos, 1);
                        addresses.unshift(addr);
                    }
                    this.broadCastChanges(oldSettings, this._remoteSettings);
                    if (this._refetchTimer === undefined) {
                        this.updateSelf();
                        this.repeatFetch();
                    }
                    // Stop trying if success
                    return true;
                }
            }
            // Don't throw error on refetching
            if (this._refetchTimer === undefined) {
                throw new back_lib_common_util_1.CriticalException('Cannot connect to any address of Configuration Service!');
            }
        });
    }
    onUpdate(listener) {
        this._eventEmitter.on('updated', listener);
    }
    applySettings() {
        this.refetchInterval = this.get(back_lib_common_constants_1.SvcSettingKeys.SETTINGS_REFETCH_INTERVAL) || (5 * 60000); // Default 5 mins
        try {
            let addresses = JSON.parse(this.get(back_lib_common_constants_1.SvcSettingKeys.SETTINGS_SERVICE_ADDRESSES));
            return (addresses && addresses.length) ? addresses : null;
        }
        catch (err) {
            console.warn(err);
            return null;
        }
    }
    updateSelf() {
        this._eventEmitter.prependListener('updated', (changedKeys) => {
            if (changedKeys.includes(back_lib_common_constants_1.SvcSettingKeys.SETTINGS_REFETCH_INTERVAL) || changedKeys.includes(back_lib_common_constants_1.SvcSettingKeys.SETTINGS_SERVICE_ADDRESSES)) {
                let addresses = this.applySettings();
                if (addresses) {
                    this._addresses = addresses;
                }
                else {
                    console.warn('New SettingService addresses are useless!');
                }
            }
        });
    }
    repeatFetch() {
        this._refetchTimer = setInterval(() => this.fetch(), this.refetchInterval);
    }
    stopRefetch() {
        clearInterval(this._refetchTimer);
        this._refetchTimer = null;
    }
    attemptFetch(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let serviceName = this.get(back_lib_common_constants_1.SvcSettingKeys.SERVICE_SLUG), ipAddress = '0.0.0.0'; // If this service runs inside a Docker container, 
                // this should be the host's IP address.
                this._rpcCaller.baseAddress = address;
                let req = back_lib_common_contracts_1.GetSettingRequest.translator.whole({
                    slug: serviceName,
                    ipAddress
                });
                let res = yield this._rpcCaller.call(back_lib_common_constants_1.ModuleNames.PROGRAM_CONFIGURATION, back_lib_common_constants_1.ActionNames.GET_SETTINGS, req);
                if (res.isSuccess) {
                    this._remoteSettings = this.parseSettings(res.payload);
                    return true;
                }
            }
            catch (err) {
                console.warn(err);
            }
            return false;
        });
    }
    broadCastChanges(oldSettings, newSettings) {
        if (!newSettings) {
            return;
        }
        let oldKeys = Object.getOwnPropertyNames(oldSettings), newKeys = Object.getOwnPropertyNames(newSettings), changedKeys = [], val;
        // Update existing values or add new keys
        for (let key of newKeys) {
            val = newSettings[key];
            if (val !== oldSettings[key]) {
                changedKeys.push(key);
            }
        }
        // Reset abandoned keys.
        for (let key of oldKeys) {
            if (!newKeys.includes(key)) {
                changedKeys.push(key);
            }
        }
        if (changedKeys.length) {
            this._eventEmitter.emit('updated', changedKeys);
        }
    }
    parseSettings(raw) {
        if (!raw) {
            return {};
        }
        let map = {}, settings = back_lib_common_contracts_1.SettingItem.translator.whole(raw);
        for (let st of settings) {
            map[st.name] = this.parseValue(st.value, st.dataType);
        }
        return map;
    }
    parseValue(val, type) {
        if (val === undefined) {
            return null;
        }
        if (type == back_lib_common_contracts_1.SettingItemDataType.String) {
            return val;
        }
        else {
            return JSON.parse(val);
        }
    }
};
ConfigurationProvider = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.inject(back_lib_service_communication_1.Types.DIRECT_RPC_CALLER)),
    __metadata("design:paramtypes", [Object])
], ConfigurationProvider);
exports.ConfigurationProvider = ConfigurationProvider;
