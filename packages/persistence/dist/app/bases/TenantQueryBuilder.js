"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TenantQueryBuilder {
    constructor(_EntityClass) {
        this._EntityClass = _EntityClass;
    }
    buildCountAll(prevQuery, rawQuery, opts = {}) {
        return prevQuery.where('tenant_id', opts.tenantId);
    }
    buildDeleteHard(pk, prevQuery, rawQuery) {
        return rawQuery.deleteById(this.toArr(pk, this._EntityClass.idProp));
    }
    buildExists(props, prevQuery, rawQuery, opts = {}) {
        return prevQuery.where('tenant_id', opts.tenantId);
    }
    buildFind(pk, prevQuery, rawQuery, opts = {}) {
        return rawQuery.findById(this.toArr(pk, this._EntityClass.idProp));
    }
    buildPage(pageIndex, pageSize, prevQuery, rawQuery, opts = {}) {
        return prevQuery.where('tenant_id', opts.tenantId);
    }
    buildPatch(entity, prevQuery, rawQuery, opts = {}) {
        return rawQuery.patch(entity).whereComposite(this._EntityClass.idColumn, '=', this.toArr(entity, this._EntityClass.idProp));
    }
    buildRecoverOpts(pk, prevOpts, rawOpts) {
        prevOpts['tenantId'] = pk.tenantId;
        return prevOpts;
    }
    buildUpdate(entity, prevQuery, rawQuery, opts = {}) {
        return rawQuery.update(entity).whereComposite(this._EntityClass.idColumn, '=', this.toArr(entity, this._EntityClass.idProp));
    }
    toArr(pk, arr) {
        return arr.map(c => pk[c]);
    }
}
exports.TenantQueryBuilder = TenantQueryBuilder;

//# sourceMappingURL=TenantQueryBuilder.js.map
