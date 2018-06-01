"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Guard_1 = require("./Guard");
class HandlerContainer {
    static get instance() {
        if (!this._instance) {
            this._instance = new HandlerContainer();
        }
        return this._instance;
    }
    constructor() {
        this._handlers = [];
    }
    set dependencyContainer(container) {
        Guard_1.Guard.assertArgDefined('container', container);
        this._depContainer = container;
    }
    get dependencyContainer() {
        return this._depContainer;
    }
    /**
     * Removes all registered handlers
     */
    clear() {
        this._handlers = [];
    }
    /**
     * Binds an action or some actions to a `dependencyIdentifier`, which is resolved to an object instance.
     * Returns a/some proxy function(s) which when called, will delegates to the actual resolved function.
     *
     * @param {string} actions Function name of the resolved object.
     * @param {string | symbol} dependencyIdentifier Key to look up and resolve from dependency container.
     * @param {ActionFactory} actionFactory A function that use `actions` name to produce the actual function to be executed.
     */
    register(actions, dependencyIdentifier, actionFactory) {
        Guard_1.Guard.assertArgDefined('action', actions);
        Guard_1.Guard.assertArgDefined('dependencyIdentifier', dependencyIdentifier);
        let fn = function (act) {
            this._handlers[act] = { dependencyIdentifier, actionFactory };
            let proxy = (function (action, context) {
                return function () {
                    return context.resolve(action).apply(null, arguments);
                };
            })(act, this);
            return proxy;
        }.bind(this);
        if (Array.isArray(actions)) {
            return actions.map(fn);
        }
        else {
            return fn(actions);
        }
    }
    /**
     * Looks up and returns a function that was registered to bind with `action`.
     * @param action Key to look up.
     */
    resolve(action) {
        Guard_1.Guard.assertIsDefined(this._depContainer, `Dependency container is not set!`);
        let detail = this._handlers[action];
        Guard_1.Guard.assertIsDefined(detail, `Action "${action}" was not registered!`);
        return this.resolveActionFunc(action, detail.dependencyIdentifier, detail.actionFactory);
    }
    resolveActionFunc(action, depId, actFactory) {
        // Attempt to resolve object instance
        let instance = this.dependencyContainer.resolve(depId);
        Guard_1.Guard.assertIsDefined(instance, `Cannot resolve dependency "${depId.toString()}"!`);
        let actionFn = instance[action];
        // If default action is not available, attempt to get action from factory.
        if (!actionFn) {
            actionFn = (actFactory ? actFactory(instance, action) : null);
        }
        Guard_1.Guard.assertIsDefined(actionFn, `Action "${action}" does not exist in object "${depId.toString()}"!`);
        return actionFn.bind(instance);
    }
}
exports.HandlerContainer = HandlerContainer;

//# sourceMappingURL=HandlerContainer.js.map
