"use strict";
// Handle validation errors
// Handle server internal errors
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
const back_lib_common_util_1 = require("back-lib-common-util");
const back_lib_common_contracts_1 = require("back-lib-common-contracts");
/**
 * Provides method to look up tenant ID from tenant slug.
 */
let ErrorHandlerFilter = class ErrorHandlerFilter {
    constructor() {
    }
    handle(req, res, next) {
        try {
            next();
        }
        catch (err) {
            if (err instanceof back_lib_common_contracts_1.ValidationError) {
                res.status(412).send(err);
            }
            else {
                // logProvider.error(err);
                res.status(500).send('server.error.internal');
            }
        }
    }
};
ErrorHandlerFilter = __decorate([
    back_lib_common_util_1.injectable(),
    __metadata("design:paramtypes", [])
], ErrorHandlerFilter);
exports.ErrorHandlerFilter = ErrorHandlerFilter;
