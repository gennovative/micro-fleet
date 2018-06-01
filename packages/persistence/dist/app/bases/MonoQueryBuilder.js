"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MonoQueryBuilder {
    constructor(_EntityClass) {
        this._EntityClass = _EntityClass;
    }
    buildCountAll(prevQuery, rawQuery, opts) {
        let q = rawQuery.count('* as total');
        return (opts.includeDeleted === false) ? q.whereNull('deleted_at') : q;
    }
    buildDeleteHard(pk, prevQuery, rawQuery) {
        return rawQuery.deleteById(pk);
    }
    buildExists(uniqVals, prevQuery, rawQuery, opts) {
        let q = rawQuery.count('* as total');
        // .whereComposite(this._EntityClass.uniqColumn, '=', this.toArr(uniqVals, this._EntityClass.uniqColumn));
        if (uniqVals && uniqVals.length) {
            q = q.where(builder => {
                this._EntityClass.uniqColumn.forEach((c, i) => {
                    let v = uniqVals[i];
                    if (v === null) {
                        builder.orWhereNull(c);
                    }
                    else if (v !== undefined) {
                        builder.orWhere(c, '=', v);
                    }
                });
            });
        }
        return (opts.includeDeleted === false) ? q.whereNull('deleted_at') : q;
    }
    buildFind(pk, prevQuery, rawQuery, opts = {}) {
        return rawQuery.findById(pk);
    }
    buildPage(pageIndex, pageSize, prevQuery, rawQuery, opts) {
        let q = rawQuery.page(pageIndex, pageSize);
        if (opts.sortBy) {
            let direction = opts.sortType || 'asc';
            q = q.orderBy(opts.sortBy, direction);
        }
        return (opts.includeDeleted === false) ? q.whereNull('deleted_at') : q;
    }
    buildPatch(entity, prevQuery, rawQuery, opts) {
        const idProp = this._EntityClass.idProp[0];
        return rawQuery.patch(entity).where(idProp, entity[idProp]);
    }
    buildRecoverOpts(pk, prevOpts, rawOpts) {
        return {
            includeDeleted: true,
        };
    }
    buildUpdate(entity, prevQuery, rawQuery, opts) {
        const idProp = this._EntityClass.idProp[0];
        return rawQuery.update(entity).where(idProp, entity[idProp]);
    }
}
exports.MonoQueryBuilder = MonoQueryBuilder;

//# sourceMappingURL=MonoQueryBuilder.js.map
