"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const back_lib_common_util_1 = require("back-lib-common-util");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to decorate REST controller class.
 * @param {string} path Segment of URL pointing to this controller.
 * 		If '_' is given, it is extract from controller class name: {path}Controller.
 * 		If not specified, it is default to be empty string.
 */
function controller(path = '') {
    return function (targetClass) {
        if (Reflect.hasOwnMetadata(MetaData_1.MetaData.CONTROLLER, targetClass)) {
            throw new back_lib_common_util_1.CriticalException('Duplicate controller decorator');
        }
        if (path == null) {
            path = '';
        }
        else if (path == '_') {
            // Extract path from controller name.
            // Only if controller name is in format {xxx}Controller.
            path = targetClass.name.match(/(.+)Controller$/)[1];
            path = path[0].toLowerCase() + path.substring(1); // to camel case
            back_lib_common_util_1.Guard.assertIsDefined(path, 'Cannot extract path from controller name');
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
        Reflect.defineMetadata(MetaData_1.MetaData.CONTROLLER, [path], targetClass);
        return targetClass;
    };
}
exports.controller = controller;
