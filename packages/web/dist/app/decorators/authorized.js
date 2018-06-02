"use strict";
// Empty operation name => must login
// Non-empty op name => check op's conditions => must or no need to login
Object.defineProperty(exports, "__esModule", { value: true });
const AuthorizeFilter_1 = require("../filters/AuthorizeFilter");
const filter_1 = require("./filter");
/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
 * 		This array function won't be executed, but is used to extract filter function name.
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function authorized() {
    return function (TargetClass, key) {
        let isActionScope = !!key; // If `key` has value, `targetClass` is "prototype" object, otherwise it's a class.
        if (isActionScope) {
        }
        TargetClass = filter_1.addFilterToTarget(AuthorizeFilter_1.AuthorizeFilter, f => f.authenticate, TargetClass, key, 9);
        return TargetClass;
    };
}
exports.authorized = authorized;
