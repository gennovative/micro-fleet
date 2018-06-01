/// <reference path="./global.d.ts" />

declare module '@micro-fleet/id-generator/dist/app/IdGenerator' {
	/// <reference types="node" />
	export type BigIdOptions = {
	    /**
	     * Datacenter identifier. It can have values from 0 to 31 (5 bits).
	     */
	    datacenter?: number;
	    /**
	     * Worker identifier. It can have values from 0 to 31 (5 bits).
	     */
	    worker?: number;
	    /**
	     * Generator identifier. It can have values from 0 to 1023 (10 bits).
	     * It can be provided instead of `datacenter` and `worker` identifiers.
	     */
	    id?: number;
	    /**
	     * Number used to reduce value of a generated timestamp.
	     * Note that this number should not exceed number of milliseconds elapsed
	     * since 1 January 1970 00:00:00 UTC (value of `Date.now()`).
	     * It can be used to generate smaller ids.
	     */
	    epoch?: number;
	};
	export type Int64 = {
	    toNumber(): number;
	    toJSON(): number;
	    toString(radix?: number): string;
	    toBuffer(raw?: boolean): Buffer;
	};
	/**
	 * Provides methods to generate bigint ID
	 */
	export class IdGenerator {
	    	    constructor(options?: BigIdOptions);
	    /**
	     * Generates a new big int ID.
	     */
	    nextBigInt(): Int64;
	    /**
	     * Generates a 7-character UID.
	     */
	    nextShortId(): string;
	    /**
	     * Generates a version-4 UUID.
	     */
	    nextUuidv4(): string;
	    wrapBigInt(value: string, radix?: number): Int64;
	    wrapBigInt(buf: Buffer): Int64;
	    wrapBigInt(value?: number): Int64;
	}

}
declare module '@micro-fleet/id-generator/dist/app/IdProvider' {
	import { IConfigurationProvider } from '@micro-fleet/common-contracts';
	import { IDirectRpcCaller } from '@micro-fleet/service-communication';
	export class IdProvider implements IServiceAddOn {
	    	    	    	    	    	    	    constructor(_configProvider: IConfigurationProvider, _rpcCaller: IDirectRpcCaller);
	    /**
	     * @see IServiceAddOn.init
	     */
	    init(): Promise<void>;
	    /**
	     * @see IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @see IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	    fetch(): Promise<void>;
	    nextBigInt(): string;
	    nextShortId(): string;
	    nextUuidv4(): string;
	    	}

}
declare module '@micro-fleet/id-generator/dist/app/Types' {
	export class Types {
	    static readonly ID_PROVIDER: string;
	}

}
declare module '@micro-fleet/id-generator' {
	export * from '@micro-fleet/id-generator/dist/app/IdGenerator';
	export * from '@micro-fleet/id-generator/dist/app/IdProvider';
	export * from '@micro-fleet/id-generator/dist/app/Types';

}
