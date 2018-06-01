"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlakeId = require("flake-idgen");
const shortid = require("shortid");
const int64_buffer_1 = require("int64-buffer");
const uuidv4 = require("uuid/v4");
/**
 * Provides methods to generate bigint ID
 */
class IdGenerator {
    constructor(options) {
        this._generator = new FlakeId(options);
        if (options && options.worker) {
            shortid.worker(options.worker);
        }
    }
    /**
     * Generates a new big int ID.
     */
    nextBigInt() {
        return new int64_buffer_1.Int64BE(this._generator.next());
    }
    /**
     * Generates a 7-character UID.
     */
    nextShortId() {
        return shortid.generate();
    }
    /**
     * Generates a version-4 UUID.
     */
    nextUuidv4() {
        return uuidv4();
    }
    /**
     * Parses input value into bigint type.
     * @param value The value to be wrapped. If not given, the behavior is same with `next()`.
     */
    wrapBigInt() {
        if (!arguments.length) {
            return this.nextBigInt();
        }
        // Equivalent with `new Int64BE(....)`
        return int64_buffer_1.Int64BE.apply(null, arguments);
    }
}
exports.IdGenerator = IdGenerator;

//# sourceMappingURL=IdGenerator.js.map
