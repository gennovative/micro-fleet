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
const decorators_1 = require("../decorators");
const { lazyInject } = decorators_1.decorators;
const AuthAddOn_1 = require("../AuthAddOn");
const Types_1 = require("../Types");
class AuthFilter {
    guard(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authResult = yield this._authAddon.authenticate(request, response, next);
                if (!authResult || !authResult.payload) {
                    return response.status(401).json({ message: authResult.info.message, name: authResult.info.name });
                }
                request.params['accountId'] = authResult.payload.accountId;
                request.params['username'] = authResult.payload.username;
                next();
            }
            catch (error) {
                // response status 401 Unthorized
            }
        });
    }
}
__decorate([
    lazyInject(Types_1.Types.AUTH_ADDON),
    __metadata("design:type", AuthAddOn_1.AuthAddOn)
], AuthFilter.prototype, "_authAddon", void 0);
exports.AuthFilter = AuthFilter;
