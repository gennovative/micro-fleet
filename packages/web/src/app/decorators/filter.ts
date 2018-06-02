/// <reference types="reflect-metadata" />

import * as acorn from 'acorn';
import * as ESTree from 'estree';
import { CriticalException, Guard, INewable } from 'back-lib-common-util';

import { MetaData } from '../constants/MetaData';


export type FilterDecorator = <T>(
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
export function filter<T>(FilterClass: INewable<T>, filterFunc: (filter: T) => Function,
		priority?: number): Function {

	return function (TargetClass: INewable<T>, key: string): Function {
		return addFilterToTarget(FilterClass, filterFunc, TargetClass, key, priority);
	};
}

/**
 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
 * depending on whether the filter is meant to apply on class or class method.
 * @param FilterClass The filter class.
 * @param filterFunc The filter method to execute.
 * @param TargetClass A class or class prototype.
 * @param targetFunc Method name, if `TargetClass` is class prototype,
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
export function addFilterToTarget<T>(FilterClass: INewable<T>, filterFunc: (filter: T) => Function,
		TargetClass: INewable<T>, targetFunc?: string, priority?: number): Function {

	let metaKey: string,
		isCtrlScope = (!targetFunc); // If `key` has value, `targetClass` is "prototype" object, otherwise it's a class.
	if (isCtrlScope) {
		metaKey = MetaData.CONTROLLER_FILTER;
	} else {
		// If @filter is applied to class method, the given `TargetClass` is actually the class's prototype.
		TargetClass = <any>TargetClass.constructor;
		metaKey = MetaData.ACTION_FILTER;
	}

	let filters: any[][] = isCtrlScope
		? Reflect.getOwnMetadata(metaKey, TargetClass)
		: Reflect.getMetadata(metaKey, TargetClass, targetFunc);
	// let filters: any[][] = Reflect.getMetadata(metaKey, TargetClass, key);
	filters = filters || [];

	pushFilterToArray(filters, FilterClass, filterFunc, priority);
	Reflect.defineMetadata(metaKey, filters, TargetClass, targetFunc);
	return TargetClass;
}

/**
 * Prepares a filter then push it to given array.
 */
export function pushFilterToArray<T>(filters: any[], FilterClass: INewable<T>, filterFunc: (filter: T) => Function, priority?: number): void {
	priority = priority || 5;
	Guard.assertIsTruthy(priority >= 1 && priority <= 10, 'Filter priority must be between 1 and 10.');
	Guard.assertIsTruthy(FilterClass.name.endsWith('Filter'), 'Filter class name must end with "Filter".');

	let filterFuncName: string;
	if (filterFunc != null) {
		let func: ESTree.Program = acorn.parse(filterFunc.toString()),
			body = func.body[0] as ESTree.ExpressionStatement,
			expression = body.expression as ESTree.ArrowFunctionExpression,
			isArrowFunc = expression.type == 'ArrowFunctionExpression';

		Guard.assertIsTruthy(isArrowFunc, '`filterFunc` must be an arrow statement.');
		filterFuncName = expression.body['property']['name'];
	} else {
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