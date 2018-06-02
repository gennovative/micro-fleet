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
const back_lib_common_util_1 = require("back-lib-common-util");
const back_lib_id_generator_1 = require("back-lib-id-generator");
let InternalControllerBase = class InternalControllerBase {
    constructor(_ClassDTO, _repo, _idProvider) {
        this._ClassDTO = _ClassDTO;
        this._repo = _repo;
        this._idProvider = _idProvider;
    }
    get validator() {
        return this._ClassDTO['validator'];
    }
    get translator() {
        return this._ClassDTO['translator'];
    }
    countAll(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Counting model');
            let count = yield this._repo.countAll(payload.options);
            resolve(count);
        });
    }
    create(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Creating model');
            payload.model.id = payload.model.id || this._idProvider.nextBigInt().toString();
            let dto = this.translator.whole(payload.model);
            dto = yield this._repo.create(dto, payload.options);
            resolve(dto);
        });
    }
    deleteHard(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Hard deleting model');
            let pk = this.validator.pk(payload.pk), nRows = yield this._repo.deleteHard(pk, payload.options);
            resolve(nRows);
        });
    }
    deleteSoft(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Soft deleting model');
            let pk = this.validator.pk(payload.pk), nRows = yield this._repo.deleteSoft(pk, payload.options);
            resolve(nRows);
        });
    }
    exists(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Checking existence');
            let gotIt = yield this._repo.exists(payload.props, payload.options);
            resolve(gotIt);
        });
    }
    findByPk(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Finding model');
            let pk = this.validator.pk(payload.pk), foundDto = yield this._repo.findByPk(pk, payload.options);
            resolve(foundDto);
        });
    }
    recover(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Recovering model');
            let pk = this.validator.pk(payload.pk), nRows = yield this._repo.recover(pk, payload.options);
            resolve(nRows);
        });
    }
    page(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Paging model');
            let models = yield this._repo.page(payload.pageIndex, payload.pageSize, payload.options);
            resolve(models);
        });
    }
    patch(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Patching model');
            let model = this.translator.partial(payload.model), updatedProps = yield this._repo.patch(model, payload.options);
            resolve(updatedProps);
        });
    }
    update(payload, resolve, reject, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Updating model');
            let model = this.translator.whole(payload.model), updatedModel = yield this._repo.update(model, payload.options);
            resolve(updatedModel);
        });
    }
};
InternalControllerBase = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.unmanaged()),
    __param(1, back_lib_common_util_1.unmanaged()),
    __param(2, back_lib_common_util_1.unmanaged()),
    __metadata("design:paramtypes", [Object, Object, back_lib_id_generator_1.IdProvider])
], InternalControllerBase);
exports.InternalControllerBase = InternalControllerBase;
