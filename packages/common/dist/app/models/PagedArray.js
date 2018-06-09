"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A wrapper array that contains paged items.
 */
class PagedArray extends Array {
    constructor(total = 0, ...items) {
        super();
        this._total = 0;
        /* istanbul ignore else */
        if (Array.isArray(items)) {
            Array.prototype.push.apply(this, items);
        }
        Object.defineProperty(this, '_total', {
            enumerable: false,
            configurable: false,
            value: total
        });
    }
    /**
     * Gets total number of items.
     */
    get total() {
        return this._total;
    }
    /**
     * Returns a serializable object.
     */
    asObject() {
        return {
            total: this._total,
            data: this.slice(0)
        };
    }
}
exports.PagedArray = PagedArray;
//# sourceMappingURL=PagedArray.js.map