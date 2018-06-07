"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (!global['automapper']) {
    require('automapper-ts');
}
class ModelAutoMapper {
    constructor(ModelClass, _validator) {
        this.ModelClass = ModelClass;
        this._validator = _validator;
        this.enableValidation = (_validator != null);
        this.createMap();
    }
    get validator() {
        return this._validator;
    }
    merge(dest, sources, options) {
        if (dest == null || typeof dest !== 'object') {
            return dest;
        }
        dest = Object.assign.apply(null, Array.isArray(sources) ? [dest, ...sources] : [dest, sources]);
        return this.partial(dest, options);
    }
    partial(source, options) {
        return this.tryTranslate('partial', source, options);
    }
    whole(source, options) {
        return this.tryTranslate('whole', source, options);
    }
    createMap() {
        automapper.createMap('any', this.ModelClass);
    }
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
        if (handleError(error, options.errorCallback)) {
            return null;
        }
        try {
            return this.map(model);
        }
        catch (ex) {
            handleError(ex, options.errorCallback);
        }
        return null;
    }
}
exports.ModelAutoMapper = ModelAutoMapper;
//# sourceMappingURL=ModelAutoMapper.js.map