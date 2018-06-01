/**
 * A data type representing Json object.
 */
interface Json {
	[x: string]: string | number | boolean | Date | Json | JsonArray;
}

interface JsonArray extends Array<string | number | boolean | Date | Json | JsonArray> { }

// Based on ES6 native Promise definition
declare type PromiseResolveFn = (value?: any | PromiseLike<any>) => void;
declare type PromiseRejectFn = (reason?: any) => void;

/**
 * A data type representing a class.
 */
declare type Newable = (new () => any);