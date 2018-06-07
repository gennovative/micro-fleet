"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const ModelAutoMapper_1 = require("../../translators/ModelAutoMapper");
const JoiModelValidator_1 = require("../../validators/JoiModelValidator");
const Exceptions_1 = require("../Exceptions");
class GetSettingRequest {
    constructor() {
        this.slug = undefined;
        this.ipAddress = undefined;
    }
}
exports.GetSettingRequest = GetSettingRequest;
let validator = GetSettingRequest.validator = JoiModelValidator_1.JoiModelValidator.create({
    slug: joi.string().regex(/^[0-9a-zA-z-]+$/).required().example('SettingSvc').example('setting-svc'),
    ipAddress: joi.string().ip().required().example('127.0.0.1').example('192.168.10.23')
}, false, false);
validator.partial = function () {
    throw new Exceptions_1.NotImplementedException('This method is not supported. Use `whole` instead.');
};
GetSettingRequest.translator = new ModelAutoMapper_1.ModelAutoMapper(GetSettingRequest, validator);
//# sourceMappingURL=GetSettingRequest.js.map