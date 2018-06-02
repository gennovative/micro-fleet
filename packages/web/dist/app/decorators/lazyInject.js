"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const ServerContext_1 = require("../ServerContext");
const INJECTION = Symbol();
function proxyGetter(proto, key, resolve) {
    function getter() {
        if (!Reflect.hasMetadata(INJECTION, this, key)) {
            Reflect.defineMetadata(INJECTION, resolve(), this, key);
        }
        return Reflect.getMetadata(INJECTION, this, key);
    }
    function setter(newVal) {
        Reflect.defineMetadata(INJECTION, newVal, this, key);
    }
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter
    });
}
/**
 * Injects value to the decorated property.
 * Used to decorate properties of a class that's cannot be resolved by dependency container.
 */
function lazyInject(depIdentifier) {
    return function (proto, key) {
        let resolve = () => ServerContext_1.serverContext.dependencyContainer.resolve(depIdentifier);
        proxyGetter(proto, key, resolve);
    };
}
exports.lazyInject = lazyInject;
