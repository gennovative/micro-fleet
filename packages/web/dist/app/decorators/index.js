"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata');
}
const lazyInject_1 = require("./lazyInject");
const controller_1 = require("./controller");
const filter_1 = require("./filter");
const action_1 = require("./action");
exports.decorators = {
    action: action_1.action,
    controller: controller_1.controller,
    filter: filter_1.filter,
    lazyInject: lazyInject_1.lazyInject
};
