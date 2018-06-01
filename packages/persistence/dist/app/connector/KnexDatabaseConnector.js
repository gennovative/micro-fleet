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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const isEmpty = require('lodash/isEmpty');
const common_util_1 = require("@micro-fleet/common-util");
/**
 * Provides settings from package
 */
let KnexDatabaseConnector = class KnexDatabaseConnector {
    constructor() {
        this._knex = knex;
    }
    /**
     * @see IDatabaseConnector.connection
     */
    get connection() {
        return this._connection;
    }
    /**
     * @see IDatabaseConnector.init
     */
    init(detail) {
        common_util_1.Guard.assertArgDefined('detail', detail);
        const settings = {
            client: detail.clientName,
            useNullAsDefault: true,
            connection: this.buildConnSettings(detail)
        }, knexConn = this._connection = this._knex(settings);
    }
    /**
     * @see IDatabaseConnector.dispose
     */
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            this._connection.destroy();
            this._connection = null;
            this._knex = null;
        });
    }
    /**
     * @see IDatabaseConnector.prepare
     */
    prepare(EntityClass, callback, atomicSession) {
        common_util_1.Guard.assertIsNotEmpty(this._connection, 'Must call addConnection() before executing any query.');
        if (atomicSession) {
            return this.prepareTransactionalQuery(EntityClass, callback, atomicSession);
        }
        return this.prepareSimpleQuery(EntityClass, callback);
    }
    buildConnSettings(detail) {
        // 1st priority: connect to a local file.
        if (detail.filePath) {
            return { filename: detail.filePath };
        }
        // 2nd priority: connect with a connection string.
        if (detail.connectionString) {
            return detail.connectionString;
        }
        // Last priority: connect with host credentials.
        if (detail.host) {
            return {
                host: detail.host.address,
                user: detail.host.user,
                password: detail.host.password,
                database: detail.host.database,
            };
        }
        throw new common_util_1.MinorException('No database settings!');
    }
    prepareSimpleQuery(EntityClass, callback) {
        let BoundClass = EntityClass['bindKnex'](this._connection);
        return callback(BoundClass['query'](), BoundClass);
    }
    prepareTransactionalQuery(EntityClass, callback, atomicSession) {
        const BoundClass = EntityClass['bindKnex'](atomicSession.connection);
        return callback(BoundClass['query'](atomicSession.transaction), BoundClass);
    }
};
KnexDatabaseConnector = __decorate([
    common_util_1.injectable(),
    __metadata("design:paramtypes", [])
], KnexDatabaseConnector);
exports.KnexDatabaseConnector = KnexDatabaseConnector;

//# sourceMappingURL=KnexDatabaseConnector.js.map
