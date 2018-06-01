const isEmpty = require('lodash/isEmpty');
const isFunction = require('lodash/isFunction');

import * as ex from './Exceptions';


export class Guard {

	/**
	 * Makes sure the specified `target` is not null or undefined.
	 * @param name {string} Name to include in error message if assertion fails.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @throws {InvalidArgumentException} If assertion fails.
	 */
	public static assertArgDefined(name: string, target: any, message?: string): void {
		if (target === null || target === undefined) {
			throw new ex.InvalidArgumentException(name, message || 'Must not be null or undefined!');
		}
	}

	/**
	 * Makes sure the specified `target` is an object, array, or string which is not null or undefined.
	 * If `target` is a string or array, it must have `length` greater than 0,
	 * If it is an object, it must have at least one property.
	 * @param name {string} Name to include in error message if assertion fails.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @throws {InvalidArgumentException} If assertion fails.
	 */
	public static assertArgNotEmpty(name: string, target: any, message?: string): void {
		if (isEmpty(target)) {
			throw new ex.InvalidArgumentException(name, message || 'Must not be null, undefined or empty!');
		}
	}

	/**
	 * Makes sure the specified `target` is a function.
	 * @param name {string} Name to include in error message if assertion fails.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @throws {InvalidArgumentException} If assertion fails.
	 */
	public static assertArgFunction(name: string, target: any, message?: string): void {
		if (!isFunction(target)) {
			throw new ex.InvalidArgumentException(name, message || 'Must be a function!');
		}
	}

	/**
	 * Makes sure the specified `target` matches Regular Expression `rule`.
	 * @param name {string} Name to include in error message if assertion fails.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @throws {InvalidArgumentException} If assertion fails.
	 */
	public static assertArgMatch(name: string, rule: RegExp, target: string, message?: string): void {
		if (!rule.test(target)) {
			throw new ex.InvalidArgumentException(name, message || 'Does not match specified rule!');
		}
	}


	/**
	 * Makes sure the specified `target` is not null or undefined.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	 * @throws {CriticalException} If assertion fails and `isCritical` is true.
	 * @throws {MinorException} If assertion fails and `isCritical` is false.
	 */
	public static assertIsDefined(target: any, message?: string, isCritical: boolean = true): void {
		Guard.assertIsFalsey(target === null || target === undefined, message, isCritical);
	}

	/**
	 * Makes sure the specified `target` is an object, array, or string which is not null or undefined.
	 * If `target` is a string or array, it must have `length` greater than 0,
	 * If it is an object, it must have at least one property.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	 * @throws {CriticalException} If assertion fails and `isCritical` is true.
	 * @throws {MinorException} If assertion fails and `isCritical` is false.
	 */
	public static assertIsNotEmpty(target: any, message?: string, isCritical: boolean = true): void {
		Guard.assertIsFalsey(isEmpty(target), message, isCritical);
	}

	/**
	 * Makes sure the specified `target` is a function.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	 * @throws {CriticalException} If assertion fails and `isCritical` is true.
	 * @throws {MinorException} If assertion fails and `isCritical` is false.
	 */
	public static assertIsFunction(target: any, message?: string, isCritical: boolean = true): void {
		Guard.assertIsTruthy(isFunction(target), message, isCritical);
	}

	/**
	 * Makes sure the specified `target` matches Regular Expression `rule`.
	 * @param target {any} Argument to check.
	 * @param message {string} Optional error message.
	 * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	 * @throws {CriticalException} If assertion fails and `isCritical` is true.
	 * @throws {MinorException} If assertion fails and `isCritical` is false.
	 */
	public static assertIsMatch(rule: RegExp, target: string, message?: string, isCritical: boolean = true): void {
		Guard.assertIsTruthy(rule.test(target), message, isCritical);
	}

	/**
	 * Makes sure the specified `target` is considered "truthy" based on JavaScript rule.
	 * @param target {any} Argument to check.
	 * @param message {string} Error message.
	 * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	 * @throws {CriticalException} If assertion fails and `isCritical` is true.
	 * @throws {MinorException} If assertion fails and `isCritical` is false.
	 */
	public static assertIsTruthy(target: any, message: string, isCritical: boolean = true): void {
		if (!target) {
			if (isCritical) {
				throw new ex.CriticalException(message);
			} else {
				throw new ex.MinorException(message);
			}
		}
	}

	/**
	 * Makes sure the specified `target` is considered "falsey" based on JavaScript rule.
	 * @param target {any} Argument to check.
	 * @param message {string} Error message.
	 * @throws {InvalidArgumentException} If assertion fails.
	 */
	public static assertIsFalsey(target: any, message: string, isCritical: boolean = true): void {
		if (target) {
			if (isCritical) {
				throw new ex.CriticalException(message);
			} else {
				throw new ex.MinorException(message);
			}
		}
	}

}