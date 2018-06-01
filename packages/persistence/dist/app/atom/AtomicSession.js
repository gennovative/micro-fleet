"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps a database connection and transaction.
 */
class AtomicSession {
    constructor(connection, transaction) {
        this.connection = connection;
        this.transaction = transaction;
    }
}
exports.AtomicSession = AtomicSession;

//# sourceMappingURL=AtomicSession.js.map
