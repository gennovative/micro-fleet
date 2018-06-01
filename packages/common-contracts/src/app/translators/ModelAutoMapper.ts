/* istanbul ignore else */
if (!global['automapper']) {
	// AutoMapper registers itself as a singleton global variable.
	require('automapper-ts');
}

import { JoiModelValidator } from '../validators/JoiModelValidator';
import { ValidationError } from '../validators/ValidationError';


export interface MappingOptions {
	/**
	 * Temporarily turns on or off model validation.
	 * Can only be turned on if validator is provided to constructor.
	 */
	enableValidation?: boolean;

	/**
	 * If specified, gives validation error to this callback. Otherwise, throw error.
	 */
	errorCallback?: (err: ValidationError) => void;
}

/**
 * Provides functions to auto mapping an arbitrary object to model of specific class type.
 */
export class ModelAutoMapper<T extends Object> {

	/**
	 * Turns on or off model validation before translating.
	 * Is set to `true` if validator is passed to class constructor.
	 */
	public enableValidation: boolean;


	/**
	 * @param {class} ModelClass The model class
	 * @param {JoiModelValidator} _validator The model validator. If specified, turn on `enableValidation`
	 */
	constructor(
		protected ModelClass: new() => any,
		protected _validator?: JoiModelValidator<T>
	) {
		this.enableValidation = (_validator != null);
		this.createMap();
	}


	/**
	 * Gets validator.
	 */
	public get validator(): JoiModelValidator<T> {
		return this._validator;
	}

	/**
	 * Copies properties from `sources` to dest then optionally validates
	 * the result (depends on `enableValidation`).
	 * If `enableValidation` is turned off, it works just like native `Object.assign()` function,
	 * therefore, use `Object.assign()` for better performance if validation is not needed.
	 * Note that it uses `partial()` internally, hence `required` validation is IGNORED.
	 * 
	 * @throws {ValidationError}
	 */
	public merge(dest: Partial<T>, sources: Partial<T> | Partial<T>[], options?: MappingOptions): Partial<T> {
		if (dest == null || typeof dest !== 'object') { return dest; }
		dest = Object.assign.apply(null, Array.isArray(sources) ? [dest, ...sources] : [dest, sources]);
		return this.partial(dest, options);
	}

	/**
	 * Validates then converts an object to type <T>. 
	 * but ONLY properties with value are validated and copied.
	 * Note that `required` validation is IGNORED.
	 * @param {any | any[]} source An object or array of objects to be translated.
	 * 
	 * @throws {ValidationError} If no `errorCallback` is provided.
	 */
	public partial(source: any | any[], options?: MappingOptions): Partial<T> & Partial<T>[] {
		return this.tryTranslate('partial', source, options);
	}

	/**
	 * Validates then converts an object to type <T>. 
	 * ALL properties are validated and copied regardless with or without value.
	 * @param {any | any[]} source An object or array of objects to be translated.
	 * 
	 * @throws {ValidationError} If no `errorCallback` is provided.
	 */
	public whole(source: any | any[], options?: MappingOptions): T & T[] {
		return this.tryTranslate('whole', source, options);
	}


	/**
	 * Initializes the model mapping engine.
	 */
	protected createMap(): void {
		automapper.createMap('any', this.ModelClass);
	}
	
	/**
	 * Is invoked after source object is validated to map source object to target model.
	 */
	protected map(source: any): T {
		return automapper.map('any', this.ModelClass, source);
	}


	private tryTranslate(fn: string, source: any | any[], options?: MappingOptions): T & T[] {
		if (source == null || typeof source !== 'object') { return source; }

		options = Object.assign(<MappingOptions>{
			enableValidation: this.enableValidation,
		}, options);

		// Translate an array or single item
		if (Array.isArray(source)) {
			return <any>source.map(s => this.translate(fn, s, options));
		}
		return <any>this.translate(fn, source, options);
	}

	private translate(fn: string, source: any, options: MappingOptions): T {
		if (!options.enableValidation) {
			return this.map(source);
		}

		let [error, model] = this.validator[fn](source),
			handleError = function (err, callback) {
				if (!err) { return false; }
				if (!callback) {
					throw err;
				}
				callback(err);
				return true;
			};

		if (handleError(error, options.errorCallback)) { // Validation error
			return null;
		}
		try {
			return this.map(model);
		} catch (ex) {
			handleError(ex, options.errorCallback); // Mapping error
		}
		return null;
	}
}