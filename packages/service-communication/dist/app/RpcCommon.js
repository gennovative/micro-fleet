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
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const common_util_1 = require("@micro-fleet/common-util");
const common_contracts_1 = require("@micro-fleet/common-contracts");
let descriptor = {
    writable: false,
    enumerable: false,
    configurable: false,
    value: null
};
if (!global.gennova) {
    descriptor.value = {};
    Object.defineProperty(global, 'gennova', descriptor);
}
let gennova = global.gennova;
/* istanbul ignore else */
if (!gennova['ValidationError']) {
    descriptor.value = common_contracts_1.ValidationError;
    Object.defineProperty(gennova, 'ValidationError', descriptor);
}
/* istanbul ignore else */
if (!gennova['MinorException']) {
    descriptor.value = common_util_1.MinorException;
    Object.defineProperty(gennova, 'MinorException', descriptor);
}
/* istanbul ignore else */
if (!gennova['InternalErrorException']) {
    descriptor.value = common_util_1.InternalErrorException;
    Object.defineProperty(gennova, 'InternalErrorException', descriptor);
}
// RPC Base classes
let RpcCallerBase = class RpcCallerBase {
    constructor() {
        this._emitter = new events_1.EventEmitter();
        this._timeout = 30000;
    }
    /**
     * @see IRpcCaller.timeout
     */
    get timeout() {
        return this._timeout;
    }
    /**
     * @see IRpcCaller.timeout
     */
    set timeout(val) {
        if (val >= 1000 && val <= 60000) {
            this._timeout = val;
        }
    }
    dispose() {
        this._emitter.removeAllListeners();
        this._emitter = null;
        return Promise.resolve();
    }
    /**
     * @see IRpcCaller.onError
     */
    onError(handler) {
        this._emitter.on('error', handler);
    }
    emitError(err) {
        this._emitter.emit('error', err);
    }
    rebuildError(payload) {
        if (payload.type) {
            // Expect response.payload.type = MinorException | ValidationError
            return new global.gennova[payload.type](payload.message);
        }
        else {
            let ex = new common_util_1.MinorException(payload.message);
            ex.stack = payload.stack;
            return ex;
        }
    }
};
RpcCallerBase = __decorate([
    common_util_1.injectable(),
    __metadata("design:paramtypes", [])
], RpcCallerBase);
exports.RpcCallerBase = RpcCallerBase;
let RpcHandlerBase = class RpcHandlerBase {
    constructor(_depContainer) {
        this._depContainer = _depContainer;
        common_util_1.Guard.assertArgDefined('_depContainer', _depContainer);
        this._emitter = new events_1.EventEmitter();
    }
    /**
     * @see IRpcHandler.onError
     */
    onError(handler) {
        this._emitter.on('error', handler);
    }
    emitError(err) {
        this._emitter.emit('error', err);
    }
    createResponse(isSuccess, payload, replyTo) {
        return {
            isSuccess,
            from: this.name,
            to: replyTo,
            payload
        };
    }
    createError(rawError) {
        // TODO: Should log this unexpected error.
        let errObj = {};
        if (rawError instanceof common_util_1.MinorException) {
            // If this is a minor error, or the action method sends this error
            // back to caller on purpose.
            errObj.type = rawError.name;
            errObj.message = rawError.message;
            errObj.detail = rawError['details'];
        }
        else if ((rawError instanceof Error) || (rawError instanceof common_util_1.Exception)) {
            // If error is an uncaught Exception/Error object, that means the action method
            // has a problem. We should not send it back to caller.
            errObj.type = 'InternalErrorException';
            errObj.message = rawError.message;
            this.emitError(rawError);
        }
        else {
            let ex = new common_util_1.MinorException(rawError + '');
            errObj.type = 'InternalErrorException';
            this.emitError(ex.message);
        }
        return errObj;
    }
};
RpcHandlerBase = __decorate([
    common_util_1.injectable(),
    __metadata("design:paramtypes", [Object])
], RpcHandlerBase);
exports.RpcHandlerBase = RpcHandlerBase;

//# sourceMappingURL=RpcCommon.js.map
