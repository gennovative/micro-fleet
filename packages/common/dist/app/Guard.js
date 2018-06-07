"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isEmpty = require('lodash/isEmpty');
const isFunction = require('lodash/isFunction');
const ex = require("./models/Exceptions");
class Guard {
    static assertArgDefined(name, target, message) {
        if (target === null || target === undefined) {
            throw new ex.InvalidArgumentException(name, message || 'Must not be null or undefined!');
        }
    }
    static assertArgNotEmpty(name, target, message) {
        if (isEmpty(target)) {
            throw new ex.InvalidArgumentException(name, message || 'Must not be null, undefined or empty!');
        }
    }
    static assertArgFunction(name, target, message) {
        if (!isFunction(target)) {
            throw new ex.InvalidArgumentException(name, message || 'Must be a function!');
        }
    }
    static assertArgMatch(name, rule, target, message) {
        if (!rule.test(target)) {
            throw new ex.InvalidArgumentException(name, message || 'Does not match specified rule!');
        }
    }
    static assertIsDefined(target, message, isCritical = true) {
        Guard.assertIsFalsey(target === null || target === undefined, message, isCritical);
    }
    static assertIsNotEmpty(target, message, isCritical = true) {
        Guard.assertIsFalsey(isEmpty(target), message, isCritical);
    }
    static assertIsFunction(target, message, isCritical = true) {
        Guard.assertIsTruthy(isFunction(target), message, isCritical);
    }
    static assertIsMatch(rule, target, message, isCritical = true) {
        Guard.assertIsTruthy(rule.test(target), message, isCritical);
    }
    static assertIsTruthy(target, message, isCritical = true) {
        if (!target) {
            if (isCritical) {
                throw new ex.CriticalException(message);
            }
            else {
                throw new ex.MinorException(message);
            }
        }
    }
    static assertIsFalsey(target, message, isCritical = true) {
        if (target) {
            if (isCritical) {
                throw new ex.CriticalException(message);
            }
            else {
                throw new ex.MinorException(message);
            }
        }
    }
}
exports.Guard = Guard;
//# sourceMappingURL=Guard.js.map