import * as FlakeId from 'flake-idgen';
import * as shortid from 'shortid';
import { Int64BE } from 'int64-buffer';
import uuidv4 = require('uuid/v4');


export type BigIdOptions = {
	
	/**
	 * Datacenter identifier. It can have values from 0 to 31 (5 bits).
	 */
	datacenter?: number,
	
	/**
	 * Worker identifier. It can have values from 0 to 31 (5 bits).
	 */
	worker?: number,

	/**
	 * Generator identifier. It can have values from 0 to 1023 (10 bits).
	 * It can be provided instead of `datacenter` and `worker` identifiers.
	 */
	id?: number,

	/**
	 * Number used to reduce value of a generated timestamp. 
	 * Note that this number should not exceed number of milliseconds elapsed
	 * since 1 January 1970 00:00:00 UTC (value of `Date.now()`).
	 * It can be used to generate smaller ids.
	 */
	epoch?: number,
};

export type Int64 = {
	toNumber(): number,
	toJSON(): number,
	toString(radix?: number): string,
	toBuffer(raw?: boolean): Buffer,
};

/**
 * Provides methods to generate bigint ID
 */
export class IdGenerator {

	private _generator: FlakeId;

	constructor(options?: BigIdOptions) {
		this._generator = new FlakeId(options);
		if (options && options.worker) {
			shortid.worker(options.worker);
		}
	}

	/**
	 * Generates a new big int ID.
	 */
	public nextBigInt(): Int64 {
		return new Int64BE(this._generator.next());
	}

	/**
	 * Generates a 7-character UID.
	 */
	public nextShortId(): string {
		return shortid.generate();
	}

	/**
	 * Generates a version-4 UUID.
	 */
	public nextUuidv4(): string {
		return uuidv4();
	}

	public wrapBigInt(value: string, radix?: number): Int64;
	public wrapBigInt(buf: Buffer): Int64;
	public wrapBigInt(value?: number): Int64;

	
	/**
	 * Parses input value into bigint type.
	 * @param value The value to be wrapped. If not given, the behavior is same with `next()`.
	 */
	public wrapBigInt(): Int64 {
		if (!arguments.length) {
			return this.nextBigInt();
		}
		// Equivalent with `new Int64BE(....)`
		return Int64BE.apply(null, arguments);
	}
}