"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Maybe {
    constructor(value) {
        this._hasValue = false;
        this._value = undefined;
        if (typeof value !== 'undefined') {
            return;
        }
        this._value = value;
        this._hasValue = true;
    }
    get hasValue() {
        return this._hasValue;
    }
    set hasValue(value) {
        this._hasValue = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
}
exports.Maybe = Maybe;
//# sourceMappingURL=Maybe.js.map