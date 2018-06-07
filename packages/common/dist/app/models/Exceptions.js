"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Error.stackTraceLimit = 20;
class Exception {
    constructor(message = '', isCritical = true, exceptionClass) {
        this.message = message;
        this.isCritical = isCritical;
        Error.captureStackTrace(this, exceptionClass || Exception);
    }
    toString() {
        return `[${(this.isCritical ? 'Critical' : 'Minor')}] ${this.message ? this.message : ''} \n ${this.stack}`;
    }
}
exports.Exception = Exception;
class CriticalException extends Exception {
    constructor(message) {
        super(message, true, CriticalException);
        this.name = 'CriticalException';
    }
}
exports.CriticalException = CriticalException;
class MinorException extends Exception {
    constructor(message) {
        super(message, false, MinorException);
        this.name = 'MinorException';
    }
}
exports.MinorException = MinorException;
class InvalidArgumentException extends Exception {
    constructor(argName, message) {
        super(`The argument "${argName}" is invalid! ${(message ? message : '')}`, false, InvalidArgumentException);
        this.name = 'InvalidArgumentException';
    }
}
exports.InvalidArgumentException = InvalidArgumentException;
class NotImplementedException extends Exception {
    constructor(message) {
        super(message, false, NotImplementedException);
        this.name = 'NotImplementedException';
    }
}
exports.NotImplementedException = NotImplementedException;
class InternalErrorException extends Exception {
    constructor(message) {
        super(message || 'An error occured on the 3rd-party side', false, InternalErrorException);
        this.name = 'InternalErrorException';
    }
}
exports.InternalErrorException = InternalErrorException;
//# sourceMappingURL=Exceptions.js.map