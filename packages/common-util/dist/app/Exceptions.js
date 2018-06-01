"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Error.stackTraceLimit = 20;
class Exception {
    /**
     *
     * @param message
     * @param isCritical
     * @param exceptionClass {class} The exception class to exclude from stacktrace.
     */
    constructor(message = '', isCritical = true, exceptionClass) {
        this.message = message;
        this.isCritical = isCritical;
        Error.captureStackTrace(this, exceptionClass || Exception);
    }
    toString() {
        // Ex 1: [Critical] A big mess has happened!
        //		 <stacktrace here>
        //
        // Ex 2: [Minor]
        //		 <stacktrace here>
        return `[${(this.isCritical ? 'Critical' : 'Minor')}] ${this.message ? this.message : ''} \n ${this.stack}`;
    }
}
exports.Exception = Exception;
/**
 * Represents a serious problem that may cause the system in unstable state
 * and need restarting.
 */
class CriticalException extends Exception {
    constructor(message) {
        super(message, true, CriticalException);
        this.name = 'CriticalException';
    }
}
exports.CriticalException = CriticalException;
/**
 * Represents an acceptable problem that can be handled
 * and the system does not need restarting.
 */
class MinorException extends Exception {
    constructor(message) {
        super(message, false, MinorException);
        this.name = 'MinorException';
    }
}
exports.MinorException = MinorException;
/**
 * Represents an error where the provided argument of a function or constructor
 * is not as expected.
 */
class InvalidArgumentException extends Exception {
    constructor(argName, message) {
        super(`The argument "${argName}" is invalid! ${(message ? message : '')}`, false, InvalidArgumentException);
        this.name = 'InvalidArgumentException';
    }
}
exports.InvalidArgumentException = InvalidArgumentException;
/**
 * Represents an error when an unimplemented method is called.
 */
class NotImplementedException extends Exception {
    constructor(message) {
        super(message, false, NotImplementedException);
        this.name = 'NotImplementedException';
    }
}
exports.NotImplementedException = NotImplementedException;
/**
 * Represents an error when an unimplemented method is called.
 */
class InternalErrorException extends Exception {
    constructor(message) {
        super(message || 'An error occured on the 3rd-party side', false, InternalErrorException);
        this.name = 'InternalErrorException';
    }
}
exports.InternalErrorException = InternalErrorException;

//# sourceMappingURL=Exceptions.js.map
