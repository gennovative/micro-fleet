"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VersionQueryBuilder {
    constructor(_EntityClass) {
        this._EntityClass = _EntityClass;
    }
    buildCountAll(prevQuery, rawQuery, opts) {
        return prevQuery.where('is_main', true);
    }
    buildDeleteHard(pk, prevQuery, rawQuery) {
        return rawQuery.deleteById(this.toArr(pk, this._EntityClass.idProp));
    }
    buildExists(props, prevQuery, rawQuery, opts) {
        return prevQuery.where('is_main', true);
    }
    buildFind(pk, prevQuery, rawQuery, opts = {}) {
        let q = rawQuery.findById(this.toArr(pk, this._EntityClass.idProp));
        if (opts.version) {
            q = q.where('version', opts.version);
        }
        else {
            q = q.where('is_main', true);
        }
        return q;
    }
    buildPage(pageIndex, pageSize, prevQuery, rawQuery, opts) {
        return prevQuery.where('is_main', true);
    }
    buildPatch(entity, prevQuery, rawQuery, opts) {
        return rawQuery.patch(entity).whereComposite(this._EntityClass.idColumn, '=', this.toArr(entity, this._EntityClass.idProp)).where('is_main', true);
    }
    buildRecoverOpts(pk, prevOpts, rawOpts) {
        return prevOpts;
    }
    buildUpdate(entity, prevQuery, rawQuery, opts) {
        return rawQuery.update(entity).whereComposite(this._EntityClass.idColumn, '=', this.toArr(entity, this._EntityClass.idProp)).where('is_main', true);
    }
    toArr(pk, arr) {
        return arr.map(c => pk[c]);
    }
}
exports.VersionQueryBuilder = VersionQueryBuilder;

//# sourceMappingURL=VersionQueryBuilder.js.map
