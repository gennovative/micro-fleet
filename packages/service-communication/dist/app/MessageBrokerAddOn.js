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
const common_1 = require("@micro-fleet/common");
const Types_1 = require("./Types");
const { MbSettingKeys: S } = common_1.constants;
let MessageBrokerAddOn = class MessageBrokerAddOn {
    constructor(_configProvider, _msgBrokerCnn) {
        this._configProvider = _configProvider;
        this._msgBrokerCnn = _msgBrokerCnn;
        common_1.Guard.assertArgDefined('_configProvider', _configProvider);
        common_1.Guard.assertArgDefined('_msgBrokerCnn', _msgBrokerCnn);
    }
    /**
     * @see IServiceAddOn.init
     */
    init() {
        let cfgAdt = this._configProvider, opts = {
            hostAddress: cfgAdt.get(S.MSG_BROKER_HOST).value,
            username: cfgAdt.get(S.MSG_BROKER_USERNAME).value,
            password: cfgAdt.get(S.MSG_BROKER_PASSWORD).value,
            exchange: cfgAdt.get(S.MSG_BROKER_EXCHANGE).value,
            queue: cfgAdt.get(S.MSG_BROKER_QUEUE).value,
            reconnectDelay: cfgAdt.get(S.MSG_BROKER_RECONN_TIMEOUT).value,
            messageExpiredIn: cfgAdt.get(S.MSG_BROKER_RECONN_TIMEOUT).value,
        };
        return this._msgBrokerCnn.connect(opts);
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
        return this._msgBrokerCnn.disconnect();
    }
};
MessageBrokerAddOn = __decorate([
    common_1.injectable(),
    __param(0, common_1.inject(common_1.Types.CONFIG_PROVIDER)),
    __param(1, common_1.inject(Types_1.Types.MSG_BROKER_CONNECTOR)),
    __metadata("design:paramtypes", [Object, Object])
], MessageBrokerAddOn);
exports.MessageBrokerAddOn = MessageBrokerAddOn;
//# sourceMappingURL=MessageBrokerAddOn.js.map