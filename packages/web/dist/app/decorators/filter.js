"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const acorn = require("acorn");
const back_lib_common_util_1 = require("back-lib-common-util");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
 * 		This array function won't be executed, but is used to extract filter function name.
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function filter(FilterClass, filterFunc, priority) {
    return function (TargetClass, key) {
        return addFilterToTarget(FilterClass, filterFunc, TargetClass, key, priority);
    };
}
exports.filter = filter;
/**
 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
 * depending on whether the filter is meant to apply on class or class method.
 * @param FilterClass The filter class.
 * @param filterFunc The filter method to execute.
 * @param TargetClass A class or class prototype.
 * @param targetFunc Method name, if `TargetClass` is class prototype,
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function addFilterToTarget(FilterClass, filterFunc, TargetClass, targetFunc, priority) {
    let metaKey, isCtrlScope = (!targetFunc); // If `key` has value, `targetClass` is "prototype" object, otherwise it's a class.
    if (isCtrlScope) {
        metaKey = MetaData_1.MetaData.CONTROLLER_FILTER;
    }
    else {
        // If @filter is applied to class method, the given `TargetClass` is actually the class's prototype.
        TargetClass = TargetClass.constructor;
        metaKey = MetaData_1.MetaData.ACTION_FILTER;
    }
    let filters = isCtrlScope
        ? Reflect.getOwnMetadata(metaKey, TargetClass)
        : Reflect.getMetadata(metaKey, TargetClass, targetFunc);
    // let filters: any[][] = Reflect.getMetadata(metaKey, TargetClass, key);
    filters = filters || [];
    pushFilterToArray(filters, FilterClass, filterFunc, priority);
    Reflect.defineMetadata(metaKey, filters, TargetClass, targetFunc);
    return TargetClass;
}
exports.addFilterToTarget = addFilterToTarget;
/**
 * Prepares a filter then push it to given array.
 */
function pushFilterToArray(filters, FilterClass, filterFunc, priority) {
    priority = priority || 5;
    back_lib_common_util_1.Guard.assertIsTruthy(priority >= 1 && priority <= 10, 'Filter priority must be between 1 and 10.');
    back_lib_common_util_1.Guard.assertIsTruthy(FilterClass.name.endsWith('Filter'), 'Filter class name must end with "Filter".');
    let filterFuncName;
    if (filterFunc != null) {
        let func = acorn.parse(filterFunc.toString()), body = func.body[0], expression = body.expression, isArrowFunc = expression.type == 'ArrowFunctionExpression';
        back_lib_common_util_1.Guard.assertIsTruthy(isArrowFunc, '`filterFunc` must be an arrow statement.');
        filterFuncName = expression.body['property']['name'];
    }
    else {
        filterFuncName = 'execute';
    }
    // `filters` is a 3-dimensioned matrix:
    // filters = [
    //		1: [ [FilterClass, funcName], [FilterClass, funcName] ]
    //		5: [ [FilterClass, funcName], [FilterClass, funcName] ]
    // ]
    filters[priority] = filters[priority] || [];
    filters[priority].push([FilterClass, filterFuncName]);
}
exports.pushFilterToArray = pushFilterToArray;
