"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const ModelAutoMapper_1 = require("../../translators/ModelAutoMapper");
const JoiModelValidator_1 = require("../../validators/JoiModelValidator");
var SettingItemDataType;
(function (SettingItemDataType) {
    SettingItemDataType["String"] = "string";
    SettingItemDataType["StringArray"] = "string[]";
    SettingItemDataType["Number"] = "number";
    SettingItemDataType["NumberArray"] = "number[]";
    SettingItemDataType["Boolean"] = "boolean";
})(SettingItemDataType = exports.SettingItemDataType || (exports.SettingItemDataType = {}));
class SettingItem {
    constructor() {
        this.name = undefined;
        this.dataType = undefined;
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