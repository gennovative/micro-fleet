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
const express = require("express");
const bodyParser = require("body-parser");
const common_util_1 = require("@micro-fleet/common-util");
const rpc = require("./RpcCommon");
let ExpressRpcHandler = ExpressRpcHandler_1 = class ExpressRpcHandler extends rpc.RpcHandlerBase {
    constructor(depContainer) {
        super(depContainer);
        this._port = 30000;
        this._container = common_util_1.HandlerContainer.instance;
        this._container.dependencyContainer = depContainer;
    }
    get port() {
        return this._port;
    }
    set port(val) {
        if (val > 0 && val <= 65535) {
            this._port = val;
        }
    }
    /**
     * @see IDirectRpcHandler.init
     */
    init(param) {
        common_util_1.Guard.assertIsFalsey(this._router, 'This RPC Caller is already initialized!');
        common_util_1.Guard.assertIsTruthy(this.name, '`name` property must be set!');
        common_util_1.Guard.assertIsTruthy(this.module, '`module` property must be set!');
        let app;
        app = this._app = (param && param.expressApp)
            ? param.expressApp
            : express();
        this._router = (param && param.expressRouter) ? param.expressRouter : express.Router();
        //app.use(bodyParser.urlencoded({extended: true})); // Parse Form values in POST request, but I don't think we need it in this case.
        app.use(bodyParser.json()); // Parse JSON in POST request
        app.use(`/${this.module}`, this._router);
    }
    /**
     * @see IRpcHandler.start
     */
    start() {
        return new Promise(resolve => {
            this._server = this._app.listen(this._port, resolve);
            this._server.on('error', err => this.emitError(err));
        });
    }
    /**
     * @see IRpcHandler.dispose
     */
    dispose() {
        return new Promise((resolve, reject) => {
            this._server.close(() => {
                this._server = null;
                resolve();
            });
        });
    }
    /**
     * @see IRpcHandler.handle
     */
    handle(actions, dependencyIdentifier, actionFactory) {
        common_util_1.Guard.assertIsDefined(this._router, '`init` method must be called first!');
        actions = Array.isArray(actions) ? actions : [actions];
        for (let a of actions) {
            common_util_1.Guard.assertIsMatch(ExpressRpcHandler_1.URL_TESTER, a, `Route "${a}" is not URL-safe!`);
            this._container.register(a, dependencyIdentifier, actionFactory);
            this._router.post(`/${a}`, this.onRequest.bind(this));
        }
    }
    onRequest(req, res) {
        let action = req.url.match(/[^\/]+$/)[0], request = req.body;
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
            res.status(200).send(this.createResponse(true, result, request.from));
        })
            .catch(error => {
            let statusCode = 500, errObj = this.createError(error);
            res.status(statusCode).send(this.createResponse(false, errObj, request.from));
        })
            // Catch error thrown by `createError()`
            .catch(this.emitError.bind(this));
    }
};
ExpressRpcHandler.URL_TESTER = (function () {
    let regexp = new RegExp(/^[a-zA-Z0-9_-]*$/);
    regexp.compile();
    return regexp;
})();
ExpressRpcHandler = ExpressRpcHandler_1 = __decorate([
    common_util_1.injectable(),
    __param(0, common_util_1.inject(common_util_1.Types.DEPENDENCY_CONTAINER)),
    __metadata("design:paramtypes", [Object])
], ExpressRpcHandler);
exports.ExpressRpcHandler = ExpressRpcHandler;
var ExpressRpcHandler_1;

//# sourceMappingURL=DirectRpcHandler.js.map
