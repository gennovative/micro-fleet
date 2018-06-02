// Empty operation name => must login
// Non-empty op name => check op's conditions => must or no need to login

/// <reference types="reflect-metadata" />

import * as acorn from 'acorn';
import * as ESTree from 'estree';
import { ModuleNames, ActionNames } from 'back-lib-common-constants';
import { CriticalException, Guard, INewable } from 'back-lib-common-util';

import { MetaData } from '../constants/MetaData';
import { AuthorizeFilter } from '../filters/AuthorizeFilter';
import { addFilterToTarget } from './filter';


export type AuthorizedDecorator = <T>(
	FilterClass: new (...param: any[]) => T,
	filterFunc: (filter: T) => Function,
	priority?: number
) => Function;


/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
 * 		This array function won't be executed, but is used to extract filter function name.
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
export function authorized(): Function {

	return function (TargetClass: INewable<any>, key: string): Function {
		let isActionScope = !!key; // If `key` has value, `targetClass` is "prototype" object, otherwise it's a class.
		if (isActionScope) {
		}
		TargetClass = addFilterToTarget<AuthorizeFilter>(AuthorizeFilter, f => f.authenticate, TargetClass, key, 9) as INewable<any>;
		return TargetClass;
	};
}