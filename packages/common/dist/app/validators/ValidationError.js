"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exceptions_1 = require("../models/Exceptions");
class ValidationError extends Exceptions_1.MinorException {
    constructor(joiDetails) {
        super();
        this.name = 'ValidationError';
        this.details = this.parseDetails(joiDetails);
        Error.captureStackTrace(this, ValidationError);
    }
    parseDetails(joiDetails) {
        let details = [];
        if (!joiDetails || !joiDetails.length) {
            return details;
        }
        joiDetails.forEach(d => {
            details.push({
                message: d.message,
                path: d.path,
                value: d.context.value
            });
        });
        return details;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=ValidationError.js.map