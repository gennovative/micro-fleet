/// <reference types="reflect-metadata" />

import { IDependencyContainer } from 'back-lib-common-util';

import { MetaData } from '../constants/MetaData';
import { serverContext } from '../ServerContext';


const INJECTION = Symbol();

function proxyGetter(proto: any, key: string, resolve: () => any) {
	function getter() {
		if (!Reflect.hasMetadata(INJECTION, this, key)) {
			Reflect.defineMetadata(INJECTION, resolve(), this, key);
		}
		return Reflect.getMetadata(INJECTION, this, key);
	}

	function setter(newVal: any) {
		Reflect.defineMetadata(INJECTION, newVal, this, key);
	}

	Object.defineProperty(proto, key, {
		configurable: true,
		enumerable: true,
		get: getter,
		set: setter
	});
}

export type LazyInjectDecorator = (depIdentifier: symbol | string) => Function;

/**
 * Injects value to the decorated property. 
 * Used to decorate properties of a class that's cannot be resolved by dependency container.
 */
export function lazyInject(depIdentifier: symbol | string): Function {
	return function (proto: any, key: string): void {
		let resolve = () => serverContext.dependencyContainer.resolve(depIdentifier);
		proxyGetter(proto, key, resolve);
	};
}