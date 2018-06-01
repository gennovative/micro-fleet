"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const every = require('lodash/every');
const isEmpty = require('lodash/isEmpty');
const AtomicSessionFactory_1 = require("../atom/AtomicSessionFactory");
class BatchProcessor {
    constructor(_mono, dbConnector) {
        this._mono = _mono;
        this._atomFac = new AtomicSessionFactory_1.AtomicSessionFactory(dbConnector);
    }
    /**
     * Gets current date time in UTC.
     */
    get utcNow() {
        return this._mono.utcNow;
    }
    /**
     * @see IRepository.countAll
     */
    countAll(opts = {}) {
        return this._mono.countAll(opts);
    }
    /**
     * @see IRepository.create
     */
    create(model, opts = {}) {
        if (Array.isArray(model)) {
            return this.execBatch(model, this.create, opts);
        }
        return this._mono.create(model, opts);
    }
    /**
     * @see ISoftDelRepository.deleteSoft
     */
    deleteSoft(pk, opts = {}) {
        if (Array.isArray(pk)) {
            return this.execBatch(pk, this.deleteSoft, opts)
                .then((r) => {
                // If batch succeeds entirely, expect "r" = [1, 1, 1, 1...]
                // If batch succeeds partially, expect "r" = [1, null, 1, null...]
                return r.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
            });
        }
        return this._mono.deleteSoft(pk, opts);
    }
    /**
     * @see IRepository.deleteHard
     */
    deleteHard(pk, opts = {}) {
        if (Array.isArray(pk)) {
            return this.execBatch(pk, this.deleteHard, opts)
                .then((r) => {
                // If batch succeeds entirely, expect "r" = [1, 1, 1, 1...]
                // If batch succeeds partially, expect "r" = [1, null, 1, null...]
                return r.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
            });
        }
        return this._mono.deleteHard(pk, opts);
    }
    /**
     * @see IRepository.exists
     */
    exists(props, opts = {}) {
        return this._mono.exists(props, opts);
    }
    /**
     * @see IRepository.findByPk
     */
    findByPk(pk, opts = {}) {
        return this._mono.findByPk(pk, opts);
    }
    /**
     * @see IRepository.page
     */
    page(pageIndex, pageSize, opts = {}) {
        return this._mono.page(pageIndex, pageSize, opts);
    }
    /**
     * @see IRepository.patch
     */
    patch(model, opts = {}) {
        if (Array.isArray(model)) {
            return this.execBatch(model, this.patch, opts);
        }
        return this._mono.patch(model, opts);
    }
    /**
     * @see ISoftDelRepository.recover
     */
    recover(pk, opts = {}) {
        if (Array.isArray(pk)) {
            return this.execBatch(pk, this.recover, opts)
                .then((r) => {
                return r.reduce((prev, curr) => curr ? prev + 1 : prev, 0);
            });
        }
        return this._mono.recover(pk, opts);
    }
    /**
     * @see IRepository.update
     */
    update(model, opts = {}) {
        if (Array.isArray(model)) {
            return this.execBatch(model, this.update, opts);
        }
        return this._mono.update(model, opts);
    }
    /**
     * @see MonoProcessor.executeQuery
     */
    executeQuery(callback, atomicSession, name = '0') {
        return this._mono.executeQuery.apply(this._mono, arguments);
    }
    /**
     * Executes batch operation in transaction.
     */
    execBatch(inputs, func, opts) {
        // Utilize the provided transaction
        if (opts.atomicSession) {
            return Promise.all(inputs.map(ip => func.call(this, ip, { atomicSession: opts.atomicSession })));
        }
        let flow = this._atomFac.startSession();
        flow.pipe(s => Promise.all(inputs.map(ip => func.call(this, ip, { atomicSession: s }))));
        return flow.closePipe();
    }
    /**
     * @see MonoProcessor.toEntity
     */
    toEntity(dto, isPartial) {
        return this._mono.toEntity.apply(this._mono, arguments);
    }
    /**
     * @see MonoProcessor.toDTO
     */
    toDTO(entity, isPartial) {
        return this._mono.toDTO.apply(this._mono, arguments);
    }
    /**
     * Maps from an array of columns to array of values.
     * @param pk Object to get values from
     * @param cols Array of column names
     */
    toArr(pk, cols) {
        return this._mono.toArr.apply(this._mono, arguments);
    }
}
exports.BatchProcessor = BatchProcessor;

//# sourceMappingURL=BatchProcessor.js.map
