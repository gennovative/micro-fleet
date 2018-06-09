"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exceptions_1 = require("./Exceptions");
/**
 * Represents an object which may or may not have a value.
 * Use this class to avoid assigning `null` to a variable.
 * Inspired by V8 Maybe: https://v8docs.nodesource.com/node-9.3/d9/d4b/classv8_1_1_maybe.html
 */
class Maybe {
    //#endregion Getters & Setters
    constructor(value) {
        this._hasValue = false;
        this._value = undefined;
        if (!arguments.length) {
            return;
        }
        this._value = value;
        this._hasValue = true;
    }
    //#region Getters & Setters
    /**
     * Gets whether this object has value or not.
     */
    get hasValue() {
        return this._hasValue;
    }
    /**
     * Attempts to get the contained value, and throws exception if there is no value.
     * Use function `TryGetValue` to avoid exception.
     * @throws {MinorException} If there is no value.
     */
    get value() {
        if (!this._hasValue) {
            throw new Exceptions_1.MinorException('MAYBE_HAS_NO_VALUE');
        }
        return this._value;
    }
    /**
     * Attempts to get the contained value, if there is not, returns the given default value.
     * @param defaultVal Value to return in case there is no contained value.
     */
    TryGetValue(defaultVal) {
        if (this._hasValue) {
            return this._value;
        }
        return defaultVal;
    }
}
exports.Maybe = Maybe;
//# sourceMappingURL=Maybe.js.map