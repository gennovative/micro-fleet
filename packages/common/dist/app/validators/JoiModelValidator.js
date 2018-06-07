"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const Guard_1 = require("../Guard");
const ValidationError_1 = require("./ValidationError");
class JoiModelValidator {
    constructor(_schemaMap, _isCompositePk = false, requirePk, _schemaMapPk) {
        this._schemaMap = _schemaMap;
        this._isCompositePk = _isCompositePk;
        this._schemaMapPk = _schemaMapPk;
        let idSchema = joi.string().regex(/^\d+$/);
        if (requirePk) {
            idSchema = idSchema.required();
        }
        if (_schemaMapPk) {
            this._schemaMapPk = _schemaMapPk;
        }
        else if (_isCompositePk) {
            this._schemaMapPk = {
                id: idSchema,
                tenantId: idSchema
            };
        }
        else {
            this._schemaMapPk = { id: idSchema };
            this._compiledPk = idSchema;
        }
    }
    static create(schemaMapModel, isCompoundPk = false, requirePk = false, schemaMapPk) {
        let validator = new JoiModelValidator(schemaMapModel, isCompoundPk, requirePk, schemaMapPk);
        validator.compile();
        return validator;
    }
    get schemaMap() {
        return this._schemaMap;
    }
    get schemaMapPk() {
        return this._schemaMapPk;
    }
    get isCompoundPk() {
        return this._isCompositePk;
    }
    pk(pk) {
        Guard_1.Guard.assertIsDefined(this._compiledPk, 'Must call `compile` before using this function!');
        let { error, value } = this._compiledPk.validate(pk);
        return (error) ? [new ValidationError_1.ValidationError(error.details), null] : [null, value];
    }
    whole(target, options = {}) {
        return this.validate(this._compiledWhole, target, options);
    }
    partial(target, options = {}) {
        return this.validate(this._compiledPartial, target, options);
    }
    compile() {
        if (!this._compiledPk) {
            if (this._isCompositePk) {
                this._compiledPk = joi.object(this._schemaMapPk);
            }
            else {
                let idMap = this.schemaMapPk;
                for (let key in idMap) {
                    if (idMap.hasOwnProperty(key)) {
                        this._compiledPk = idMap[key];
                        break;
                    }
                }
            }
        }
        let wholeSchema = this._schemaMap;
        this._compiledWhole = joi.object(wholeSchema);
        let partialSchema = {};
        for (let key in wholeSchema) {
            if (wholeSchema.hasOwnProperty(key)) {
                let rule = wholeSchema[key];
                if (typeof rule.optional === 'function') {
                    partialSchema[key] = rule.optional();
                }
            }
        }
        this._compiledPartial = joi.object(partialSchema);
        this._compiledWhole = this._compiledWhole.keys(this._schemaMapPk);
        this._compiledPartial = this._compiledPartial.keys(this._schemaMapPk);
    }
    validate(schema, target, options = {}) {
        Guard_1.Guard.assertIsDefined(schema, 'Must call `compile` before using this function!');
        let opts = Object.assign({
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        }, options);
        let { error, value } = schema.validate(target, opts);
        return (error) ? [new ValidationError_1.ValidationError(error.details), null] : [null, value];
    }
}
exports.JoiModelValidator = JoiModelValidator;
//# sourceMappingURL=JoiModelValidator.js.map