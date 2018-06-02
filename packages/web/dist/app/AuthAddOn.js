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
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const back_lib_common_contracts_1 = require("back-lib-common-contracts");
const back_lib_common_util_1 = require("back-lib-common-util");
const TrailsServerAddOn_1 = require("./TrailsServerAddOn");
const Types_1 = require("./Types");
const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;
let AuthAddOn = class AuthAddOn {
    constructor(_serverAddOn, _configProvider) {
        this._serverAddOn = _serverAddOn;
        this._configProvider = _configProvider;
    }
    get server() {
        return this._serverAddOn.server;
    }
    //#region Init
    /**
     * @see IServiceAddOn.init
     */
    init() {
        this._serverAddOn.server['config'].web.middlewares.passportInit = passport.initialize();
        const opts = {
            algorithms: ['HS256'],
            secretOrKey: this._configProvider.get('jwtSecret'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: this._configProvider.get('jwtIssuer'),
        };
        this.initToken(opts);
        return Promise.resolve();
    }
    initToken(opts) {
        // `payload` is decrypted from Access token from header.
        let strategy = new JwtStrategy(opts, (payload, done) => {
            // TODO: 1. Validate payload object
            // Optional: Log timestamp for statistics purpose
            done(null, payload);
        });
        passport.use('jwt', strategy);
    }
    //#endregion Init
    authenticate(request, response, next) {
        return new Promise((resolve, reject) => {
            passport.authenticate('jwt', (error, payload, info, status) => {
                if (error) {
                    return reject(error);
                }
                resolve({ payload, info, status });
            })(request, response, next);
        });
    }
    createToken(payload, isRefresh) {
        return __awaiter(this, void 0, void 0, function* () {
            let sign = new Promise((resolve, reject) => {
                jwt.sign(
                // Data
                {
                    accountId: payload.id,
                    username: payload.username
                }, 
                // Secret
                this._configProvider.get('jwtSecret'), 
                // Config
                {
                    expiresIn: isRefresh ? '30d' : 60 * 30,
                    issuer: this._configProvider.get('jwtIssuer'),
                }, 
                // Callback
                (err, token) => {
                    if (token) {
                        resolve(token);
                    }
                });
            });
            let token = yield sign;
            return token;
        });
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
        return Promise.resolve();
    }
};
AuthAddOn = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.inject(Types_1.Types.TRAILS_ADDON)),
    __param(1, back_lib_common_util_1.inject(back_lib_common_contracts_1.Types.CONFIG_PROVIDER)),
    __metadata("design:paramtypes", [TrailsServerAddOn_1.TrailsServerAddOn, Object])
], AuthAddOn);
exports.AuthAddOn = AuthAddOn;
