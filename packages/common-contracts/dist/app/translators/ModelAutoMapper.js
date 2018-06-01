"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore else */
if (!global['automapper']) {
    // AutoMapper registers itself as a singleton global variable.
    require('automapper-ts');
}
/**
 * Provides functions to auto mapping an arbitrary object to model of specific class type.
 */
class ModelAutoMapper {
    /**
     * @param {class} ModelClass The model class
     * @param {JoiModelValidator} _validator The model validator. If specified, turn on `enableValidation`
     */
    constructor(ModelClass, _validator) {
        this.ModelClass = ModelClass;
        this._validator = _validator;
        this.enableValidation = (_validator != null);
        this.createMap();
    }
    /**
     * Gets validator.
     */
    get validator() {
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
    merge(dest, sources, options) {
        if (dest == null || typeof dest !== 'object') {
            return dest;
        }
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
    partial(source, options) {
        return this.tryTranslate('partial', source, options);
    }
    /**
     * Validates then converts an object to type <T>.
     * ALL properties are validated and copied regardless with or without value.
     * @param {any | any[]} source An object or array of objects to be translated.
     *
     * @throws {ValidationError} If no `errorCallback` is provided.
     */
    whole(source, options) {
        return this.tryTranslate('whole', source, options);
    }
    /**
     * Initializes the model mapping engine.
     */
    createMap() {
        automapper.createMap('any', this.ModelClass);
    }
    /**
     * Is invoked after source object is validated to map source object to target model.
     */
    map(source) {
        return automapper.map('any', this.ModelClass, source);
    }
    tryTranslate(fn, source, options) {
        if (source == null || typeof source !== 'object') {
            return source;
        }
        options = Object.assign({
            enableValidation: this.enableValidation,
        }, options);
        // Translate an array or single item
        if (Array.isArray(source)) {
            return source.map(s => this.translate(fn, s, options));
        }
        return this.translate(fn, source, options);
    }
    translate(fn, source, options) {
        if (!options.enableValidation) {
            return this.map(source);
        }
        let [error, model] = this.validator[fn](source), handleError = function (err, callback) {
            if (!err) {
                return false;
            }
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
        }
        catch (ex) {
            handleError(ex, options.errorCallback); // Mapping error
        }
        return null;
    }
}
exports.ModelAutoMapper = ModelAutoMapper;

//# sourceMappingURL=ModelAutoMapper.js.map
