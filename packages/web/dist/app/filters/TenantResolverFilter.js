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
const back_lib_cache_provider_1 = require("back-lib-cache-provider");
const back_lib_common_util_1 = require("back-lib-common-util");
/**
 * Provides method to look up tenant ID from tenant slug.
 */
let TenantResolverFilter = class TenantResolverFilter {
    constructor(_cache) {
        this._cache = _cache;
        this._tenants = new Map();
    }
    resolve(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tenantSlug } = req.params;
            // Preserved slug, specially for system services.
            if (tenantSlug == '_') {
                req.params['tenantId'] = null;
                return next();
            }
            let key = `common-web::tenant::${tenantSlug}`, tenantId;
            if (this._cache) {
                tenantId = (yield this._cache.getPrimitive(key, false, false));
            }
            else {
                tenantId = this._tenants.get(tenantSlug);
            }
            if (tenantId) {
                console.log('TenantResolver: from cache');
                req.params['tenantId'] = tenantId;
                return next();
            }
            // let tenant = await this._tenantProvider.findBySlug(tenantSlug);
            // if (!tenant) { return null; }
            // Mocking
            let tenant = { id: Math.random() + '' };
            if (this._cache) {
                this._cache.setPrimitive(key, tenant.id, null, back_lib_cache_provider_1.CacheLevel.BOTH);
            }
            else {
                this._tenants.set(tenantSlug, tenant.id);
            }
            console.log('TenantResolver: from repo');
            req.params['tenantId'] = tenant.id;
            next();
        });
    }
};
TenantResolverFilter = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.inject(back_lib_cache_provider_1.Types.CACHE_PROVIDER)),
    __metadata("design:paramtypes", [back_lib_cache_provider_1.CacheProvider])
], TenantResolverFilter);
exports.TenantResolverFilter = TenantResolverFilter;
