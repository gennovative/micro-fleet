/// <reference path="./global.d.ts" />

declare module '@micro-fleet/common-util/dist/app/Exceptions' {
	export class Exception implements Error {
	    readonly message: string;
	    readonly isCritical: boolean;
	    stack: string;
	    name: string;
	    /**
	     *
	     * @param message
	     * @param isCritical
	     * @param exceptionClass {class} The exception class to exclude from stacktrace.
	     */
	    constructor(message?: string, isCritical?: boolean, exceptionClass?: Function);
	    toString(): string;
	}
	/**
	 * Represents a serious problem that may cause the system in unstable state
	 * and need restarting.
	 */
	export class CriticalException extends Exception {
	    constructor(message?: string);
	}
	/**
	 * Represents an acceptable problem that can be handled
	 * and the system does not need restarting.
	 */
	export class MinorException extends Exception {
	    constructor(message?: string);
	}
	/**
	 * Represents an error where the provided argument of a function or constructor
	 * is not as expected.
	 */
	export class InvalidArgumentException extends Exception {
	    constructor(argName: string, message?: string);
	}
	/**
	 * Represents an error when an unimplemented method is called.
	 */
	export class NotImplementedException extends Exception {
	    constructor(message?: string);
	}
	/**
	 * Represents an error when an unimplemented method is called.
	 */
	export class InternalErrorException extends Exception {
	    constructor(message?: string);
	}

}
declare module '@micro-fleet/common-util/dist/app/Guard' {
	export class Guard {
	    /**
	     * Makes sure the specified `target` is not null or undefined.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgDefined(name: string, target: any, message?: string): void;
	    /**
	     * Makes sure the specified `target` is an object, array, or string which is not null or undefined.
	     * If `target` is a string or array, it must have `length` greater than 0,
	     * If it is an object, it must have at least one property.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgNotEmpty(name: string, target: any, message?: string): void;
	    /**
	     * Makes sure the specified `target` is a function.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgFunction(name: string, target: any, message?: string): void;
	    /**
	     * Makes sure the specified `target` matches Regular Expression `rule`.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgMatch(name: string, rule: RegExp, target: string, message?: string): void;
	    /**
	     * Makes sure the specified `target` is not null or undefined.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsDefined(target: any, message?: string, isCritical?: boolean): void;
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
	    static assertIsNotEmpty(target: any, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is a function.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsFunction(target: any, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` matches Regular Expression `rule`.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsMatch(rule: RegExp, target: string, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is considered "truthy" based on JavaScript rule.
	     * @param target {any} Argument to check.
	     * @param message {string} Error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsTruthy(target: any, message: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is considered "falsey" based on JavaScript rule.
	     * @param target {any} Argument to check.
	     * @param message {string} Error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertIsFalsey(target: any, message: string, isCritical?: boolean): void;
	}

}
declare module '@micro-fleet/common-util/dist/app/DependencyContainer' {
	import { injectable, inject, decorate, interfaces, unmanaged } from 'inversify';
	export class BindingScope<T> {
	    	    constructor(_binding: interfaces.BindingInWhenOnSyntax<T>);
	    asSingleton(): void;
	    asTransient(): void;
	}
	export { injectable, inject, decorate, unmanaged };
	export interface INewable<T> extends interfaces.Newable<T> {
	}
	export interface IDependencyContainer {
	    /**
	     * Registers `constructor` as resolvable with key `identifier`.
	     * @param {string | symbol} identifier - The key used to resolve this dependency.
	     * @param {INewable<T>} constructor - A class that will be resolved with `identifier`.
	     *
	     * @return {BindingScope} - A BindingScope instance that allows settings dependency as singleton or transient.
	     */
	    bind<TInterface>(identifier: string | symbol, constructor: INewable<TInterface>): BindingScope<TInterface>;
	    /**
	     * Registers a constant value with key `identifier`.
	     * @param {string | symbol} identifier - The key used to resolve this dependency.
	     * @param {T} value - The constant value to store.
	     */
	    bindConstant<T>(identifier: string | symbol, value: T): any;
	    /**
	     * Gets rid of all registered dependencies.
	     */
	    dispose(): void;
	    /**
	     * Checks if an identifier is bound with any dependency.
	     */
	    isBound(identifier: string | symbol): boolean;
	    /**
	     * Retrieves an instance of dependency with all its own dependencies resolved.
	     * @param {string | Symbol} - The key that was used to register before.
	     *
	     * @return {T} - An instance of registered type, or null if that type was not registered.
	     */
	    resolve<T>(identifier: string | symbol): T;
	    /**
	     * Gets rid of the dependency related to this identifier.
	     */
	    unbind(identifier: string | symbol): void;
	}
	export class DependencyContainer {
	    	    constructor();
	    /**
	     * @see IDependencyContainer.bind
	     */
	    bind<TInterface>(identifier: string | symbol, constructor: INewable<TInterface>): BindingScope<TInterface>;
	    /**
	     * @see IDependencyContainer.bindConstant
	     */
	    bindConstant<T>(identifier: string | symbol, value: T): void;
	    /**
	     * @see IDependencyContainer.dispose
	     */
	    dispose(): void;
	    /**
	     * @see IDependencyContainer.isBound
	     */
	    isBound(identifier: string | symbol): boolean;
	    /**
	     * @see IDependencyContainer.resolve
	     */
	    resolve<T>(identifier: string | symbol): T;
	    /**
	     * @see IDependencyContainer.unbind
	     */
	    unbind(identifier: string | symbol): void;
	    	    	}

}
declare module '@micro-fleet/common-util/dist/app/HandlerContainer' {
	import { IDependencyContainer } from '@micro-fleet/common-util/dist/app/DependencyContainer';
	export type ActionFactory = (obj, action: string) => Function;
	export type HandlerDetails = {
	    dependencyIdentifier: string | symbol;
	    actionFactory?: ActionFactory;
	};
	export class HandlerContainer {
	    	    static readonly instance: HandlerContainer;
	    	    	    	    dependencyContainer: IDependencyContainer;
	    /**
	     * Removes all registered handlers
	     */
	    clear(): void;
	    /**
	     * Binds an action or some actions to a `dependencyIdentifier`, which is resolved to an object instance.
	     * Returns a/some proxy function(s) which when called, will delegates to the actual resolved function.
	     *
	     * @param {string} actions Function name of the resolved object.
	     * @param {string | symbol} dependencyIdentifier Key to look up and resolve from dependency container.
	     * @param {ActionFactory} actionFactory A function that use `actions` name to produce the actual function to be executed.
	     */
	    register(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Function & Function[];
	    /**
	     * Looks up and returns a function that was registered to bind with `action`.
	     * @param action Key to look up.
	     */
	    resolve(action: string): Function;
	    	}

}
declare module '@micro-fleet/common-util/dist/app/Types' {
	export class Types {
	    static readonly DEPENDENCY_CONTAINER: string;
	}

}
declare module '@micro-fleet/common-util' {
	import 'bluebird-global';
	export * from '@micro-fleet/common-util/dist/app/DependencyContainer';
	export * from '@micro-fleet/common-util/dist/app/Exceptions';
	export * from '@micro-fleet/common-util/dist/app/Guard';
	export * from '@micro-fleet/common-util/dist/app/HandlerContainer';
	export * from '@micro-fleet/common-util/dist/app/Types';

}
