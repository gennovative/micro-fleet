"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps a database connection and transaction.
 */
class AtomicSession {
    constructor(knexConnection, knexTransaction) {
        this.knexConnection = knexConnection;
        this.knexTransaction = knexTransaction;
    }
}
exports.AtomicSession = AtomicSession;

//# sourceMappingURL=AtomicSession.js.map
