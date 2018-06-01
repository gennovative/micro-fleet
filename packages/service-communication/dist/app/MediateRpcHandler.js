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
const common_util_1 = require("@micro-fleet/common-util");
const Types_1 = require("./Types");
const rpc = require("./RpcCommon");
let MessageBrokerRpcHandler = class MessageBrokerRpcHandler extends rpc.RpcHandlerBase {
    constructor(depContainer, _msgBrokerConn) {
        super(depContainer);
        this._msgBrokerConn = _msgBrokerConn;
        common_util_1.Guard.assertArgDefined('_msgBrokerConn', _msgBrokerConn);
        this._container = common_util_1.HandlerContainer.instance;
        this._container.dependencyContainer = depContainer;
    }
    /**
     * @see IRpcHandler.init
     */
    init(params) {
        this._msgBrokerConn && this._msgBrokerConn.onError(err => this.emitError(err));
    }
    /**
     * @see IRpcHandler.start
     */
    start() {
        return this._msgBrokerConn.listen(this.onMessage.bind(this));
    }
    /**
     * @see IRpcHandler.dispose
     */
    dispose() {
        // Stop listening then unsbuscribe all topic patterns.
        return Promise.all([
            this._msgBrokerConn.stopListen(),
            this._msgBrokerConn.unsubscribeAll()
        ]);
    }
    /**
     * @see IMediateRpcHandler.handle
     */
    handle(actions, dependencyIdentifier, actionFactory) {
        return __awaiter(this, void 0, void 0, function* () {
            common_util_1.Guard.assertIsDefined(this.name, '`name` property is required.');
            common_util_1.Guard.assertIsDefined(this.module, '`module` property is required.');
            actions = Array.isArray(actions) ? actions : [actions];
            return Promise.all(actions.map(a => {
                this._container.register(a, dependencyIdentifier, actionFactory);
                return this._msgBrokerConn.subscribe(`request.${this.module}.${a}`);
            }));
        });
    }
    /**
     * @see IMediateRpcHandler.handleCRUD
     */
    handleCRUD(dependencyIdentifier, actionFactory) {
        return this.handle(['countAll', 'create', 'delete', 'find', 'patch', 'update'], dependencyIdentifier, actionFactory);
    }
    onMessage(msg) {
        let action = msg.raw.fields.routingKey.match(/[^\.]+$/)[0], request = msg.data, correlationId = msg.properties.correlationId, replyTo = msg.properties.replyTo;
        (new Promise((resolve, reject) => {
            let actionFn = this._container.resolve(action);
            try {
                // Execute controller's action
                let output = actionFn(request.payload, resolve, reject, request);
                if (output instanceof Promise) {
                    output.catch(reject); // Catch async exceptions.
                }
            }
            catch (err) { // Catch normal exceptions.
                reject(err);
            }
        }))
            .then(result => {
            // Sends response to reply topic
            return this._msgBrokerConn.publish(replyTo, this.createResponse(true, result, request.from), { correlationId });
        })
            .catch(error => {
            let errObj = this.createError(error);
            // nack(); // Disable this, because we use auto-ack.
            return this._msgBrokerConn.publish(replyTo, this.createResponse(false, errObj, request.from), { correlationId });
        })
            // Catch error thrown by `createError()`
            .catch(this.emitError.bind(this));
    }
};
MessageBrokerRpcHandler = __decorate([
    common_util_1.injectable(),
    __param(0, common_util_1.inject(common_util_1.Types.DEPENDENCY_CONTAINER)),
    __param(1, common_util_1.inject(Types_1.Types.MSG_BROKER_CONNECTOR)),
    __metadata("design:paramtypes", [Object, Object])
], MessageBrokerRpcHandler);
exports.MessageBrokerRpcHandler = MessageBrokerRpcHandler;

//# sourceMappingURL=MediateRpcHandler.js.map
