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
const common_contracts_1 = require("@micro-fleet/common-contracts");
const common_util_1 = require("@micro-fleet/common-util");
const Types_1 = require("./Types");
const { DbSettingKeys: S } = common_contracts_1.constants;
/**
 * Initializes database connections.
 */
let DatabaseAddOn = class DatabaseAddOn {
    constructor(_configProvider, _dbConnector) {
        this._configProvider = _configProvider;
        this._dbConnector = _dbConnector;
        common_util_1.Guard.assertArgDefined('_configProvider', _configProvider);
        common_util_1.Guard.assertArgDefined('_dbConnector', _dbConnector);
    }
    /**
     * @see IServiceAddOn.init
     */
    init() {
        this.addConnections();
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
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dbConnector.dispose();
            this._dbConnector = null;
            this._configProvider = null;
        });
    }
    addConnections() {
        let connDetail;
        connDetail = this.buildConnDetails();
        if (connDetail) {
            this._dbConnector.init(connDetail);
        }
        if (!this._dbConnector.connection) {
            throw new common_util_1.CriticalException('No database settings!');
        }
    }
    buildConnDetails() {
        let provider = this._configProvider, cnnDetail = {
            clientName: provider.get(S.DB_ENGINE) // Must belong to `DbClient`
        }, value;
        // 1st priority: connect to a local file.
        value = provider.get(S.DB_FILE);
        if (value) {
            cnnDetail.filePath = value;
            return cnnDetail;
        }
        // 2nd priority: connect with a connection string.
        value = provider.get(S.DB_CONN_STRING);
        if (value) {
            cnnDetail.connectionString = value;
            return cnnDetail;
        }
        // Last priority: connect with host credentials.
        value = provider.get(S.DB_HOST);
        if (value) {
            cnnDetail.host = {
                address: provider.get(S.DB_HOST),
                user: provider.get(S.DB_USER),
                password: provider.get(S.DB_PASSWORD),
                database: provider.get(S.DB_NAME),
            };
            return cnnDetail;
        }
        return null;
    }
};
DatabaseAddOn = __decorate([
    common_util_1.injectable(),
    __param(0, common_util_1.inject(common_contracts_1.Types.CONFIG_PROVIDER)),
    __param(1, common_util_1.inject(Types_1.Types.DB_CONNECTOR)),
    __metadata("design:paramtypes", [Object, Object])
], DatabaseAddOn);
exports.DatabaseAddOn = DatabaseAddOn;

//# sourceMappingURL=DatabaseAddOn.js.map
