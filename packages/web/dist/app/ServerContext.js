"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Serves as a global object for all web-related classes (controllers, policies...)
 * to use.
 */
class ServerContext {
    /**
     * Gets dependency container.
     */
    get dependencyContainer() {
        return this._depContainer;
    }
    /**
     * Gets path prefix. Eg: /api/v1.
     */
    get pathPrefix() {
        return this._pathPrefix;
    }
    setDependencyContainer(container) {
        this._depContainer = container;
    }
    setPathPrefix(prefix) {
        if (prefix.length >= 1 && !prefix.startsWith('/')) {
            // Add heading slash
            prefix = '/' + prefix;
        }
        if (prefix.endsWith('/')) {
            // Remove trailing slash
            prefix = prefix.substr(0, prefix.length - 1);
        }
        this._pathPrefix = prefix;
    }
}
exports.ServerContext = ServerContext;
exports.serverContext = new ServerContext();
