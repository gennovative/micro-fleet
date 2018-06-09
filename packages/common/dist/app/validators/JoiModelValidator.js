"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const Guard_1 = require("../Guard");
const ValidationError_1 = require("./ValidationError");
class JoiModelValidator {
    /**
     * @param {joi.SchemaMap} _schemaMap Rules to validate model properties.
     * @param {boolean} _isCompositePk Whether the primary key is compound. Default to `false`
     * 	This param is IGNORED if param `schemaMapPk` has value.
     * @param {boolean} requirePk Whether to validate ID.
     * 	This param is IGNORED if param `schemaMapPk` has value.
     * @param {joi.SchemaMap} _schemaMapId Rule to validate model PK.
     */
    constructor(_schemaMap, _isCompositePk = false, requirePk, _schemaMapPk) {
        this._schemaMap = _schemaMap;
        this._isCompositePk = _isCompositePk;
        this._schemaMapPk = _schemaMapPk;
        // As default, model ID is a string of 64-bit integer.
        // JS cannot handle 64-bit integer, that's why we must use string.
        // The database will convert to BigInt type when inserting.
        let idSchema = joi.string().regex(/^\d+$/);
        if (requirePk) {
            idSchema = idSchema.required();
        }
        if (_schemaMapPk) {
            this._schemaMapPk = _schemaMapPk;
        }
        else if (_isCompositePk) {
            // this._compiledPk = joi.object({
            // 		id: idSchema,
            // 		tenantId: idSchema
            // 	})
            // 	.required();
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
    /**
     * Builds a new instance of ModelValidatorBase.
     * @param {joi.SchemaMap} schemaMapModel Rules to validate model properties.
     * @param {boolean} isCompoundPk Whether the primary key is compound. Default to `false`.
     * 	This param is IGNORED if param `schemaMapPk` has value.
     * @param {boolean} requirePk Whether to validate PK.
     * 	This param is IGNORED if param `schemaMapPk` has value.
     * 	Default to be `false`.
     * @param {joi.SchemaMap} schemaMapPk Rule to validate model PK.
     */
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
    /**
     * Validates model PK.
     */
    pk(pk) {
        Guard_1.Guard.assertIsDefined(this._compiledPk, 'Must call `compile` before using this function!');
        let { error, value } = this._compiledPk.validate(pk);
        return (error) ? [new ValidationError_1.ValidationError(error.details), null] : [null, value];
    }
    /**
     * Validates model for creation operation, which doesn't need `pk` property.
     */
    whole(target, options = {}) {
        return this.validate(this._compiledWhole, target, options);
    }
    /**
     * Validates model for modification operation, which requires `pk` property.
     */
    partial(target, options = {}) {
        return this.validate(this._compiledPartial, target, options);
    }
    /**
     * Must call this method before using `whole` or `partial`,
     * or after `schemaMap` or `schemaMapId` is changed.
     */
    compile() {
        if (!this._compiledPk) {
            if (this._isCompositePk) {
                this._compiledPk = joi.object(this._schemaMapPk);
            }
            else {
                // Compile rule for simple PK with only one property
                let idMap = this.schemaMapPk;
                for (let key in idMap) {
                    /* istanbul ignore else */
                    if (idMap.hasOwnProperty(key)) {
                        this._compiledPk = idMap[key];
                        break; // Only get the first rule
                    }
                }
            }
        }
        let wholeSchema = this._schemaMap;
        this._compiledWhole = joi.object(wholeSchema);
        // Make all rules optional for partial schema.
        let partialSchema = {};
        for (let key in wholeSchema) {
            /* istanbul ignore else */
            if (wholeSchema.hasOwnProperty(key)) {
                let rule = wholeSchema[key];
                /* istanbul ignore else */
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