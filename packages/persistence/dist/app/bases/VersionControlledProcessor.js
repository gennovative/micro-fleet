"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const every = require('lodash/every');
const isEmpty = require('lodash/isEmpty');
const AtomicSessionFactory_1 = require("../atom/AtomicSessionFactory");
const MonoProcessor_1 = require("./MonoProcessor");
const VersionQueryBuilder_1 = require("./VersionQueryBuilder");
class VersionControlledProcessor extends MonoProcessor_1.MonoProcessor {
    constructor(EntityClass, dbConnector, options = {}) {
        super(EntityClass, dbConnector, options);
        this._triggerProps = options.triggerProps;
        this._queryBuilders.push(new VersionQueryBuilder_1.VersionQueryBuilder(EntityClass));
        this._atomFac = new AtomicSessionFactory_1.AtomicSessionFactory(dbConnector);
    }
    create(model, opts = {}) {
        let entity = this.toEntity(model, false);
        if (!entity['version']) {
            entity['version'] = model['version'] = 1;
        }
        return this.executeQuery(query => query.insert(entity), opts.atomicSession)
            .then(() => model);
    }
    patch(model, opts = {}) {
        if (this.isIntersect(Object.keys(model), this._triggerProps)) {
            return this.saveAsNew(null, model);
        }
        return super.patch.apply(this, arguments);
    }
    update(model, opts = {}) {
        if (this.isIntersect(Object.keys(model), this._triggerProps)) {
            return this.saveAsNew(null, model);
        }
        return super.update.apply(this, arguments);
    }
    saveAsNew(pk, updatedModel) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let source = yield this.findByPk(pk || updatedModel);
            if (!source) {
                return null;
            }
            let flow = this._atomFac.startSession();
            flow
                .pipe(s => {
                updatedModel['isMain'] = false;
                return _super("patch").call(this, updatedModel);
            })
                .pipe(s => {
                let clone = Object.assign({}, source, updatedModel, { version: source['version'] + 1 });
                return this.create(clone);
            });
            return flow.closePipe();
        });
    }
    isIntersect(arr1, arr2) {
        for (let a of arr1) {
            if (arr2.includes(a)) {
                return true;
            }
        }
        return false;
    }
}
exports.VersionControlledProcessor = VersionControlledProcessor;

//# sourceMappingURL=VersionControlledProcessor.js.map
