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
const every = require('lodash/every');
const isEmpty = require('lodash/isEmpty');
const common_util_1 = require("@micro-fleet/common-util");
const MonoProcessor_1 = require("./MonoProcessor");
const BatchProcessor_1 = require("./BatchProcessor");
const VersionControlledProcessor_1 = require("./VersionControlledProcessor");
let RepositoryBase = class RepositoryBase {
    constructor(_EntityClass, _dbConnector, _options = {}) {
        this._EntityClass = _EntityClass;
        this._dbConnector = _dbConnector;
        common_util_1.Guard.assertArgDefined('EntityClass', _EntityClass);
        common_util_1.Guard.assertArgDefined('dbConnector', _dbConnector);
        _options = this._options = Object.assign({
            isMultiTenancy: false,
            isVersionControlled: false,
            triggerProps: [],
            isBatchSupport: true
        }, _options);
        let processor = new MonoProcessor_1.MonoProcessor(_EntityClass, _dbConnector, _options);
        // TODO: Should let `VersionControlledProcessor` accepts `MonoProcessor` as argument.
        _options.isVersionControlled && (processor = new VersionControlledProcessor_1.VersionControlledProcessor(_EntityClass, _dbConnector, _options));
        _options.isBatchSupport && (processor = new BatchProcessor_1.BatchProcessor(processor, _dbConnector));
        this._processor = processor;
    }
    /**
     * @see IRepository.countAll
     */
    countAll(opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._processor.countAll(opts);
        });
    }
    /**
     * @see IRepository.create
     */
    create(model, opts = {}) {
        return this._processor.create(model, opts);
    }
    /**
     * @see ISoftDelRepository.deleteSoft
     */
    deleteSoft(pk, opts = {}) {
        return this._processor.deleteSoft(pk, opts);
    }
    /**
     * @see IRepository.deleteHard
     */
    deleteHard(pk, opts = {}) {
        return this._processor.deleteHard(pk, opts);
    }
    /**
     * @see IRepository.exists
     */
    exists(props, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._processor.exists(props, opts);
        });
    }
    /**
     * @see IRepository.findByPk
     */
    findByPk(pk, opts = {}) {
        return this._processor.findByPk(pk, opts);
    }
    /**
     * @see IRepository.page
     */
    page(pageIndex, pageSize, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._processor.page(pageIndex, pageSize, opts);
        });
    }
    /**
     * @see IRepository.patch
     */
    patch(model, opts = {}) {
        return this._processor.patch(model, opts);
    }
    /**
     * @see ISoftDelRepository.recover
     */
    recover(pk, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._processor.recover(pk, opts);
        });
    }
    /**
     * @see IRepository.update
     */
    update(model, opts = {}) {
        return this._processor.update(model, opts);
    }
};
RepositoryBase = __decorate([
    common_util_1.injectable(),
    __param(0, common_util_1.unmanaged()), __param(1, common_util_1.unmanaged()),
    __param(2, common_util_1.unmanaged()),
    __metadata("design:paramtypes", [Object, Object, Object])
], RepositoryBase);
exports.RepositoryBase = RepositoryBase;

//# sourceMappingURL=RepositoryBase.js.map
