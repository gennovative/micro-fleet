"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_util_1 = require("@micro-fleet/common-util");
/**
 * Represents an error when a model does not pass validation.
 */
class ValidationError extends common_util_1.MinorException {
    constructor(joiDetails) {
        super(null);
        this.name = 'ValidationError';
        this.details = this.parseDetails(joiDetails);
        Error.captureStackTrace(this, ValidationError);
    }
    parseDetails(joiDetails) {
        let details = [];
        /* istanbul ignore next */
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
