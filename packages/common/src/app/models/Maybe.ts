import { MinorException } from './Exceptions';

/**
 * Represents an object which may or may not have a value.
 * Use this class to avoid assigning `null` to a variable.
 * Inspired by V8 Maybe: https://v8docs.nodesource.com/node-9.3/d9/d4b/classv8_1_1_maybe.html
 */
export class Maybe<T> {
	private _hasValue: boolean = false;
	private _value: T = undefined;

	//#region Getters & Setters

	/**
	 * Gets whether this object has value or not.
	 */
	public get hasValue(): boolean {
		return this._hasValue;
	}

	/**
	 * Attempts to get the contained value, and throws exception if there is no value.
	 * Use function `TryGetValue` to avoid exception.
	 * @throws {MinorException} If there is no value.
	 */
	public get value(): T {
		return this._value;
	}

	//#endregion Getters & Setters

	constructor(value?: T) {
		if (typeof value !== 'undefined') { return; }
		this._value = value;
		this._hasValue = true;
	}

	/**
	 * Attempts to get the contained value, if there is not, returns the given default value.
	 * @param defaultVal Value to return in case there is no contained value.
	 */
	public TryGetValue(defaultVal: T): T {
		if (this._hasValue) {
			return this._value;
		}
		return defaultVal;
	}
}