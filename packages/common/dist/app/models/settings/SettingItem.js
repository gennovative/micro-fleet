"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const ModelAutoMapper_1 = require("../../translators/ModelAutoMapper");
const JoiModelValidator_1 = require("../../validators/JoiModelValidator");
var SettingItemDataType;
(function (SettingItemDataType) {
    /**
     * Text data type, that is rendered as a text box on UI.
     */
    SettingItemDataType["String"] = "string";
    /**
     * Array of strings.
     */
    SettingItemDataType["StringArray"] = "string[]";
    /**
     * Numeric data type including integer and float, that is rendered as
     * a numeric box on UI.
     */
    SettingItemDataType["Number"] = "number";
    /**
     * Array of numbers.
     */
    SettingItemDataType["NumberArray"] = "number[]";
    /**
     * Logical data type (true/false), that is rendered as a checkbox on UI.
     */
    SettingItemDataType["Boolean"] = "boolean";
})(SettingItemDataType = exports.SettingItemDataType || (exports.SettingItemDataType = {}));
/**
 * Represents a setting record.
 */
class SettingItem {
    constructor() {
        /**
         * Gets or sets setting name (aka setting key).
         * This is also the key in `appconfig.json` and the name of environment variable.
         */
        this.name = undefined;
        /**
         * Gets or sets data type of setting value.
         * Must be one of: 'string', 'string[]', 'number', 'number[]', 'boolean'.
         */
        this.dataType = undefined;
        /**
         * Gets or set value.
         * Whatever `dataType` is, value must always be string.
         */
        this.value = undefined;
    }
}
exports.SettingItem = SettingItem;
SettingItem.validator = JoiModelValidator_1.JoiModelValidator.create({
    name: joi.string().token().required(),
    dataType: joi.string().required().only(SettingItemDataType.String, SettingItemDataType.StringArray, SettingItemDataType.Number, SettingItemDataType.NumberArray, SettingItemDataType.Boolean),
    value: joi.string().allow('').required()
}, false, false);
SettingItem.translator = new ModelAutoMapper_1.ModelAutoMapper(SettingItem, SettingItem.validator);
//# sourceMappingURL=SettingItem.js.map