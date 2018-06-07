Error.stackTraceLimit = 20;

export class Exception implements Error {

	public stack: string;
	public name: string;


	/**
	 * 
	 * @param message 
	 * @param isCritical 
	 * @param exceptionClass {class} The exception class to exclude from stacktrace.
	 */
	constructor(
			public readonly message: string = '',
			public readonly isCritical: boolean = true,
			exceptionClass?: Function) {

		Error.captureStackTrace(this, exceptionClass || Exception);
	}

	public toString(): string {
		// Ex 1: [Critical] A big mess has happened!
		//		 <stacktrace here>
		//
		// Ex 2: [Minor]
		//		 <stacktrace here>
		return `[${ (this.isCritical ? 'Critical' : 'Minor') }] ${ this.message ? this.message : '' } \n ${this.stack}`;
	}
}

/**
 * Represents a serious problem that may cause the system in unstable state 
 * and need restarting.
 */
export class CriticalException extends Exception {

	constructor(message?: string) {
		super(message, true, CriticalException);
		this.name = 'CriticalException';
	}
}

/**
 * Represents an acceptable problem that can be handled 
 * and the system does not need restarting.
 */
export class MinorException extends Exception {

	constructor(message?: string) {
		super(message, false, MinorException);
		this.name = 'MinorException';
	}
}

/**
 * Represents an error where the provided argument of a function or constructor
 * is not as expected.
 */
export class InvalidArgumentException extends Exception {

	constructor(argName: string, message?: string) {
		super(`The argument "${argName}" is invalid! ${(message ? message : '')}`, false, InvalidArgumentException);
		this.name = 'InvalidArgumentException';
	}
}

/**
 * Represents an error when an unimplemented method is called.
 */
export class NotImplementedException extends Exception {
	
	constructor(message?: string) {
		super(message, false, NotImplementedException);
		this.name = 'NotImplementedException';
	}
}

/**
 * Represents an error whose origin is from another system.
 */
export class InternalErrorException extends Exception {
	
	constructor(message?: string) {
		super(message || 'An error occured on the 3rd-party side', false, InternalErrorException);
		this.name = 'InternalErrorException';
	}
}