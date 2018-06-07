"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PagedArray extends Array {
    constructor(total = 0, ...items) {
        super();
        if (Array.isArray(items)) {
            Array.prototype.push.apply(this, items);
        }
        Object.defineProperty(this, '_total', {
            enumerable: false,
            configurable: false,
        });
        this._total = total;
    }
    get total() {
        return this._total;
    }
    asObject() {
        return {
            total: this._total,
            data: this.slice(0)
        };
    }
}
exports.PagedArray = PagedArray;
//# sourceMappingURL=PagedArray.js.map