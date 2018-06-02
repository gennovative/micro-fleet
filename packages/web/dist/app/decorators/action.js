"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const back_lib_common_util_1 = require("back-lib-common-util");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to decorate action function of REST controller class.
 * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
 * @param {string} path Segment of URL pointing to this controller.
 * 		If '_' is given, uses target function name as path.
 * 		If not specified, it is default to be empty tring.
 */
function action(method = 'GET', path = '') {
    return function (proto, funcName) {
        if (Reflect.hasOwnMetadata(MetaData_1.MetaData.ACTION, proto.constructor, funcName)) {
            throw new back_lib_common_util_1.CriticalException('Duplicate action decorator');
        }
        if (path == null) {
            path = '';
        }
        else if (path == '_') {
            path = funcName;
        }
        else {
            if (path.length >= 1 && !path.startsWith('/')) {
                // Add heading slash
                path = '/' + path;
            }
            if (path.endsWith('/')) {
                // Remove trailing slash
                path = path.substr(0, path.length - 1);
            }
        }
        Reflect.defineMetadata(MetaData_1.MetaData.ACTION, [method, path], proto.constructor, funcName);
        return proto;
    };
}
exports.action = action;
