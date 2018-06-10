/// <reference path="./global.d.ts" />
declare module 'app/models/Exceptions' {
	export class Exception implements Error {
	    readonly message: string;
	    readonly isCritical: boolean;
	    stack: string;
	    name: string;
	    /**
	     *
	     * @param message
	     * @param isCritical
	     * @param exceptionClass {class} The exception class to exclude from stacktrace.
	     */
	    constructor(message?: string, isCritical?: boolean, exceptionClass?: Function);
	    toString(): string;
	}
	/**
	 * Represents a serious problem that may cause the system in unstable state
	 * and need restarting.
	 */
	export class CriticalException extends Exception {
	    constructor(message?: string);
	}
	/**
	 * Represents an acceptable problem that can be handled
	 * and the system does not need restarting.
	 */
	export class MinorException extends Exception {
	    constructor(message?: string);
	}
	/**
	 * Represents an error where the provided argument of a function or constructor
	 * is not as expected.
	 */
	export class InvalidArgumentException extends Exception {
	    constructor(argName: string, message?: string);
	}
	/**
	 * Represents an error when an unimplemented method is called.
	 */
	export class NotImplementedException extends Exception {
	    constructor(message?: string);
	}
	/**
	 * Represents an error whose origin is from another system.
	 */
	export class InternalErrorException extends Exception {
	    constructor(message?: string);
	}

}
declare module 'app/Guard' {
	export class Guard {
	    /**
	     * Makes sure the specified `target` is not null or undefined.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgDefined(name: string, target: any, message?: string): void;
	    /**
	     * Makes sure the specified `target` is an object, array, or string which is not null or undefined.
	     * If `target` is a string or array, it must have `length` greater than 0,
	     * If it is an object, it must have at least one property.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgNotEmpty(name: string, target: any, message?: string): void;
	    /**
	     * Makes sure the specified `target` is a function.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgFunction(name: string, target: any, message?: string): void;
	    /**
	     * Makes sure the specified `target` matches Regular Expression `rule`.
	     * @param name {string} Name to include in error message if assertion fails.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertArgMatch(name: string, rule: RegExp, target: string, message?: string): void;
	    /**
	     * Makes sure the specified `target` is not null or undefined.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsDefined(target: any, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is an object, array, or string which is not null or undefined.
	     * If `target` is a string or array, it must have `length` greater than 0,
	     * If it is an object, it must have at least one property.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsNotEmpty(target: any, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is a function.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsFunction(target: any, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` matches Regular Expression `rule`.
	     * @param target {any} Argument to check.
	     * @param message {string} Optional error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsMatch(rule: RegExp, target: string, message?: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is considered "truthy" based on JavaScript rule.
	     * @param target {any} Argument to check.
	     * @param message {string} Error message.
	     * @param isCritical {boolean} If true, throws CriticalException. Otherwise, throws MinorException when assertion fails.
	     * @throws {CriticalException} If assertion fails and `isCritical` is true.
	     * @throws {MinorException} If assertion fails and `isCritical` is false.
	     */
	    static assertIsTruthy(target: any, message: string, isCritical?: boolean): void;
	    /**
	     * Makes sure the specified `target` is considered "falsey" based on JavaScript rule.
	     * @param target {any} Argument to check.
	     * @param message {string} Error message.
	     * @throws {InvalidArgumentException} If assertion fails.
	     */
	    static assertIsFalsey(target: any, message: string, isCritical?: boolean): void;
	}

}
declare module 'app/DependencyContainer' {
	import { injectable, inject, decorate, interfaces, unmanaged } from 'inversify';
	export class BindingScope<T> {
	    	    constructor(_binding: interfaces.BindingInWhenOnSyntax<T>);
	    asSingleton(): void;
	    asTransient(): void;
	}
	export { injectable, inject, decorate, unmanaged };
	export interface INewable<T> extends interfaces.Newable<T> {
	}
	export interface IDependencyContainer {
	    /**
	     * Registers `constructor` as resolvable with key `identifier`.
	     * @param {string | symbol} identifier - The key used to resolve this dependency.
	     * @param {INewable<T>} constructor - A class that will be resolved with `identifier`.
	     *
	     * @return {BindingScope} - A BindingScope instance that allows settings dependency as singleton or transient.
	     */
	    bind<TInterface>(identifier: string | symbol, constructor: INewable<TInterface>): BindingScope<TInterface>;
	    /**
	     * Registers a constant value with key `identifier`.
	     * @param {string | symbol} identifier - The key used to resolve this dependency.
	     * @param {T} value - The constant value to store.
	     */
	    bindConstant<T>(identifier: string | symbol, value: T): void;
	    /**
	     * Gets rid of all registered dependencies.
	     */
	    dispose(): void;
	    /**
	     * Checks if an identifier is bound with any dependency.
	     */
	    isBound(identifier: string | symbol): boolean;
	    /**
	     * Retrieves an instance of dependency with all its own dependencies resolved.
	     * @param {string | Symbol} - The key that was used to register before.
	     *
	     * @return {T} - An instance of registered type, or null if that type was not registered.
	     */
	    resolve<T>(identifier: string | symbol): T;
	    /**
	     * Gets rid of the dependency related to this identifier.
	     */
	    unbind(identifier: string | symbol): void;
	}
	export class DependencyContainer {
	    	    constructor();
	    /**
	     * @see IDependencyContainer.bind
	     */
	    bind<TInterface>(identifier: string | symbol, constructor: INewable<TInterface>): BindingScope<TInterface>;
	    /**
	     * @see IDependencyContainer.bindConstant
	     */
	    bindConstant<T>(identifier: string | symbol, value: T): void;
	    /**
	     * @see IDependencyContainer.dispose
	     */
	    dispose(): void;
	    /**
	     * @see IDependencyContainer.isBound
	     */
	    isBound(identifier: string | symbol): boolean;
	    /**
	     * @see IDependencyContainer.resolve
	     */
	    resolve<T>(identifier: string | symbol): T;
	    /**
	     * @see IDependencyContainer.unbind
	     */
	    unbind(identifier: string | symbol): void;
	    	    	}

}
declare module 'app/HandlerContainer' {
	import { IDependencyContainer } from 'app/DependencyContainer';
	export type ActionFactory = (obj: any, action: string) => Function;
	export type HandlerDetails = {
	    dependencyIdentifier: string | symbol;
	    actionFactory?: ActionFactory;
	};
	export class HandlerContainer {
	    	    static readonly instance: HandlerContainer;
	    	    	    	    dependencyContainer: IDependencyContainer;
	    /**
	     * Removes all registered handlers
	     */
	    clear(): void;
	    /**
	     * Binds an action or some actions to a `dependencyIdentifier`, which is resolved to an object instance.
	     * Returns a/some proxy function(s) which when called, will delegates to the actual resolved function.
	     *
	     * @param {string} actions Function name of the resolved object.
	     * @param {string | symbol} dependencyIdentifier Key to look up and resolve from dependency container.
	     * @param {ActionFactory} actionFactory A function that use `actions` name to produce the actual function to be executed.
	     */
	    register(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Function & Function[];
	    /**
	     * Looks up and returns a function that was registered to bind with `action`.
	     * @param action Key to look up.
	     */
	    resolve(action: string): Function;
	    	}

}
declare module 'app/Types' {
	export class Types {
	    static readonly CONFIG_PROVIDER: string;
	    static readonly DEPENDENCY_CONTAINER: string;
	}

}
declare module 'app/constants/DbClient' {
	/**
	 * Db driver names.
	 */
	export enum DbClient {
	    /**
	     * Microsoft SQL Server
	     */
	    MSSQL = "mssql",
	    /**
	     * MySQL
	     */
	    MYSQL = "mysql",
	    /**
	     * PostgreSQL
	     */
	    POSTGRESQL = "pg",
	    /**
	     * SQLite 3
	     */
	    SQLITE3 = "sqlite3"
	}

}
declare module 'app/constants/ports' {
	export enum ServicePorts {
	    SETTINGS = 50100
	}

}
declare module 'app/constants/names/actions' {
	export enum ActionNames {
	    /**
	     * Assign to group
	     */
	    ASSIGN_TO_GROUP = "assignToGroup",
	    /**
	     * Can deploy
	     */
	    CAN_DEPLOY = "canDeploy",
	    /**
	     * Create
	     */
	    CREATE = "create",
	    /**
	     * Count all
	     */
	    COUNT_ALL = "countAll",
	    /**
	     * Configure program
	     */
	    CONFIGURE_PROGRAM = "configureProgram",
	    /**
	     * Configure program group
	     */
	    CONFIGURE_PROGRAM_GROUP = "configureProgramGroup",
	    /**
	     * Deploy
	     */
	    DEPLOY = "deploy",
	    /**
	     * Soft delete
	     */
	    DELETE_SOFT = "deleteSoft",
	    /**
	     * Hard delete
	     */
	    DELETE_HARD = "deleteHard",
	    /**
	     * Hard delete versions
	     */
	    DELETE_HARD_VERSIONS = "deleteHardVersions",
	    /**
	     * Exists
	     */
	    EXISTS = "exists",
	    /**
	     * Find by PK
	     */
	    FIND_BY_PK = "findByPk",
	    /**
	     * Get by host ID
	     */
	    GET_BY_HOST_ID = "getByHostId",
	    /**
	     * Get by program slug
	     */
	    GET_BY_PROGRAM_SLUG = "getByProgramSlug",
	    /**
	     * Get by program ID
	     */
	    GET_BY_PROGRAM_ID = "getByProgramId",
	    /**
	     * Get settings
	     */
	    GET_SETTINGS = "getSettings",
	    /**
	     * Get programs
	     */
	    GET_PROGRAMS = "getPrograms",
	    /**
	     * Next big int
	     */
	    NEXT_BIG_INT = "nextBigInt",
	    /**
	     * Next short ID
	     */
	    NEXT_SHORT_ID = "nextShortId",
	    /**
	     * Next version-4 UUID
	     */
	    NEXT_UUID_V4 = "nextUuidv4",
	    /**
	     * Page
	     */
	    PAGE = "page",
	    /**
	     * Page
	     */
	    PAGE_VERSIONS = "pageVersions",
	    /**
	     * Patch
	     */
	    PATCH = "patch",
	    /**
	     * Recover
	     */
	    RECOVER = "recover",
	    /**
	     * Restrict quantity
	     */
	    RESTRICT_QUANTITY = "restrictQuantity",
	    /**
	     * Recover
	     */
	    SET_AS_MAIN = "setAsMain",
	    /**
	     * Upload
	     */
	    UPLOAD = "upload",
	    /**
	     * Update
	     */
	    UPDATE = "update"
	}

}
declare module 'app/constants/names/modules' {
	export enum ModuleNames {
	    /**
	     * Account
	     */
	    ACCOUNT = "account",
	    /**
	     * Account configuration
	     */
	    ACCOUNT_CONFIGURATION = "accConfig",
	    /**
	     * Agency
	     */
	    AGENCY = "agency",
	    /**
	     * Asset
	     */
	    ASSET = "asset",
	    /**
	     * Audit
	     */
	    AUDIT = "audit",
	    /**
	     * Brand
	     */
	    BRAND = "brand",
	    /**
	     * Bio-profile
	     */
	    BIO_PROFILE = "bioProfile",
	    /**
	     * Civilian
	     */
	    CIVILIAN = "civilian",
	    /**
	     * Country
	     */
	    COUNTRY = "country",
	    /**
	     * Device
	     */
	    DEVICE = "device",
	    /**
	     * Device group
	     */
	    DEVICE_GROUP = "deviceGroup",
	    /**
	     * Event
	     */
	    EVENT = "event",
	    /**
	     * Host
	     */
	    HOST = "host",
	    /**
	     * ID Generator
	     */
	    ID_GEN = "idGen",
	    /**
	     * Geo-profile
	     */
	    GEO_PROFILE = "geoProfile",
	    /**
	     * Gift
	     */
	    GIFT = "gift",
	    /**
	     * Location
	     */
	    LOCATION = "location",
	    /**
	     * Playlist
	     */
	    PLAYLIST = "playlist",
	    /**
	     * Profile
	     */
	    PROFILE = "profile",
	    /**
	     * Program
	     */
	    PROGRAM = "program",
	    /**
	     * Program configuration
	     */
	    PROGRAM_CONFIGURATION = "progConfig",
	    /**
	     * Program group
	     */
	    PROGRAM_GROUP = "progGroup",
	    /**
	     * Region
	     */
	    REGION = "region",
	    /**
	     * Role
	     */
	    ROLE = "role",
	    /**
	     * Settings
	     */
	    SETTINGS = "settings",
	    /**
	     * Schedule
	     */
	    SCHEDULE = "schedule",
	    /**
	     * Tenant
	     */
	    TENANT = "tenant",
	    /**
	     * Tenant configuration
	     */
	    TENANT_CONFIGURATION = "tenantConfig"
	}

}
declare module 'app/constants/setting-keys/cache' {
	export enum CacheSettingKeys {
	    /**
	     * Number of cache servers in cluster.
	     * Data type: number
	     */
	    CACHE_NUM_CONN = "cache_num_conn",
	    /**
	     * IP or host name of cache service.
	     * Must use with connection index: CACHE_HOST + '0', CACHE_HOST + '1'
	     * Data type: string
	     */
	    CACHE_HOST = "cache_host_",
	    /**
	     * Port number.
	     * Data type: number
	     */
	    CACHE_PORT = "db_port_"
	}

}
declare module 'app/constants/setting-keys/database' {
	export enum DbSettingKeys {
	    /**
	     * Name of database engine.
	     * Data type: enum `DbClient` in `back-lib-persistence`
	     */
	    DB_ENGINE = "db_engine_",
	    /**
	     * IP or host name of database.
	     * Must use with connection index: DB_HOST + '0', DB_HOST + '1'
	     * Data type: string
	     */
	    DB_ADDRESS = "db_host_",
	    /**
	     * Username to log into database.
	     * Must use with connection index: DB_USER + '0', DB_USER + '1'
	     * Data type: string
	     */
	    DB_USER = "db_user_",
	    /**
	     * Password to log into database.
	     * Must use with connection index: DB_PASSWORD + '0', DB_PASSWORD + '1'
	     * Data type: string
	     */
	    DB_PASSWORD = "db_pass_",
	    /**
	     * Database name.
	     * Must use with connection index: DB_NAME + '0', DB_NAME + '1'
	     * Data type: string
	     */
	    DB_NAME = "db_name_",
	    /**
	     * Path to database file.
	     * Must use with connection index: DB_FILE + '0', DB_FILE + '1'
	     * Data type: string
	     */
	    DB_FILE = "db_file_",
	    /**
	     * Database connection string.
	     * Must use with connection index: DB_CONN_STRING + '0', DB_CONN_STRING + '1'
	     * Data type: string
	     */
	    DB_CONN_STRING = "db_connStr_"
	}

}
declare module 'app/constants/setting-keys/message-broker' {
	export enum MbSettingKeys {
	    /**
	     * IP or host name of message broker.
	     * Data type: string
	     */
	    MSG_BROKER_HOST = "msgBroker_host",
	    /**
	     * Exchange name on message broker.
	     * Data type: string
	     */
	    MSG_BROKER_EXCHANGE = "msgBroker_exchange",
	    /**
	     * Default queue name to connect to.
	     * Data type: string
	     */
	    MSG_BROKER_QUEUE = "msgBroker_queue",
	    /**
	     * Number of milliseconds to delay before reconnect to message broker.
	     * Data type: number
	     */
	    MSG_BROKER_RECONN_TIMEOUT = "msgBroker_reconnectTimeout",
	    /**
	     * Username to log into message broker.
	     * Data type: string
	     */
	    MSG_BROKER_USERNAME = "msgBroker_username",
	    /**
	     * Password to log into message broker.
	     * Data type: string
	     */
	    MSG_BROKER_PASSWORD = "msgBroker_password",
	    /**
	     * Number of milliseconds that messages live in queue.
	     * Data type: number
	     */
	    MSG_BROKER_MSG_EXPIRE = "msgBroker_msg_expr"
	}

}
declare module 'app/constants/setting-keys/rpc' {
	export enum RpcSettingKeys {
	    /**
	     * Number of milliseconds after which RPC caller stops waiting for response.
	     * Data type: number
	     */
	    RPC_CALLER_TIMEOUT = "rpc_caller_timeout",
	    /**
	     * Http port to which HTTP RPC handler listens.
	     * Data type: number
	     */
	    RPC_HANDLER_PORT = "rpc_handler_port"
	}

}
declare module 'app/constants/setting-keys/service' {
	export enum SvcSettingKeys {
	    /**
	     * Number of milliseconds to wait before actually stop addons.
	     * Date type: number
	     */
	    ADDONS_DEADLETTER_TIMEOUT = "addons_deadletter_timeout",
	    /**
	     * Array of addresses to SettingService.
	     * Data type: string[]
	     */
	    SETTINGS_SERVICE_ADDRESSES = "settings_service_addresses",
	    /**
	     * Array of addresses to IdGeneratorService.
	     * Data type: string[]
	     */
	    ID_SERVICE_ADDRESSES = "id_service_addresses",
	    /**
	     * Number of milliseconds between refetchings.
	     * Date type: number
	     */
	    SETTINGS_REFETCH_INTERVAL = "settings_refetch_interval",
	    /**
	     * Service URL-safe name.
	     * Data type: string
	     */
	    SERVICE_SLUG = "service_slug"
	}

}
declare module 'app/constants/index' {
	import { DbClient } from 'app/constants/DbClient';
	import { ServicePorts } from 'app/constants/ports';
	import { ActionNames } from 'app/constants/names/actions';
	import { ModuleNames } from 'app/constants/names/modules';
	import { CacheSettingKeys } from 'app/constants/setting-keys/cache';
	import { DbSettingKeys } from 'app/constants/setting-keys/database';
	import { MbSettingKeys } from 'app/constants/setting-keys/message-broker';
	import { RpcSettingKeys } from 'app/constants/setting-keys/rpc';
	import { SvcSettingKeys } from 'app/constants/setting-keys/service';
	export type Constants = {
	    DbClient: typeof DbClient;
	    ServicePorts: typeof ServicePorts;
	    ActionNames: typeof ActionNames;
	    ModuleNames: typeof ModuleNames;
	    CacheSettingKeys: typeof CacheSettingKeys;
	    DbSettingKeys: typeof DbSettingKeys;
	    MbSettingKeys: typeof MbSettingKeys;
	    RpcSettingKeys: typeof RpcSettingKeys;
	    SvcSettingKeys: typeof SvcSettingKeys;
	};
	export const constants: Constants;

}
declare module 'app/models/Maybe' {
	/**
	 * Represents an object which may or may not have a value.
	 * Use this class to avoid assigning `null` to a variable.
	 * Inspired by V8 Maybe: https://v8docs.nodesource.com/node-9.3/d9/d4b/classv8_1_1_maybe.html
	 */
	export class Maybe<T> {
	    	    	    /**
	     * Gets whether this object has value or not.
	     */
	    readonly hasValue: boolean;
	    /**
	     * Attempts to get the contained value, and throws exception if there is no value.
	     * Use function `TryGetValue` to avoid exception.
	     * @throws {MinorException} If there is no value.
	     */
	    readonly value: T;
	    constructor(value?: T);
	    /**
	     * Attempts to get the contained value, if there is not, returns the given default value.
	     * @param defaultVal Value to return in case there is no contained value.
	     */
	    TryGetValue(defaultVal: T): T;
	}

}
declare module 'app/validators/ValidationError' {
	import * as joi from 'joi';
	import { MinorException } from 'app/models/Exceptions';
	/**
	 * Represents a validation error for a property.
	 * UI Form should use this information to highlight the particular input.
	 */
	export type ValidationErrorItem = {
	    /**
	     * Error message for this item.
	     */
	    message: string;
	    /**
	     * Path to the target property in validation schema.
	     */
	    path: string[];
	    /**
	     * The invalid property value.
	     */
	    value: any;
	};
	/**
	 * Represents an error when a model does not pass validation.
	 */
	export class ValidationError extends MinorException {
	    readonly details: ValidationErrorItem[];
	    constructor(joiDetails: joi.ValidationErrorItem[]);
	    	}

}
declare module 'app/validators/JoiModelValidator' {
	import * as joi from 'joi';
	import { ValidationError } from 'app/validators/ValidationError';
	export interface ValidationOptions extends joi.ValidationOptions {
	}
	export class JoiModelValidator<T> {
	    protected _schemaMap: joi.SchemaMap;
	    protected _isCompositePk: boolean;
	    protected _schemaMapPk?: joi.SchemaMap;
	    /**
	     * Builds a new instance of ModelValidatorBase.
	     * @param {joi.SchemaMap} schemaMapModel Rules to validate model properties.
	     * @param {boolean} isCompoundPk Whether the primary key is compound. Default to `false`.
	     * 	This param is IGNORED if param `schemaMapPk` has value.
	     * @param {boolean} requirePk Whether to validate PK.
	     * 	This param is IGNORED if param `schemaMapPk` has value.
	     * 	Default to be `false`.
	     * @param {joi.SchemaMap} schemaMapPk Rule to validate model PK.
	     */
	    static create<T>(schemaMapModel: joi.SchemaMap, isCompoundPk?: boolean, requirePk?: boolean, schemaMapPk?: joi.SchemaMap): JoiModelValidator<T>;
	    /**
	     * Compiled rules for compound model primary key.
	     */
	    protected _compiledPk: joi.ObjectSchema;
	    /**
	     * Compiled rules for model properties.
	     */
	    protected _compiledWhole: joi.ObjectSchema;
	    /**
	     * Compiled rules for model properties, but all of them are OPTIONAL.
	     * Used for patch operation.
	     */
	    protected _compiledPartial: joi.ObjectSchema;
	    /**
	     * @param {joi.SchemaMap} _schemaMap Rules to validate model properties.
	     * @param {boolean} _isCompositePk Whether the primary key is compound. Default to `false`
	     * 	This param is IGNORED if param `schemaMapPk` has value.
	     * @param {boolean} requirePk Whether to validate ID.
	     * 	This param is IGNORED if param `schemaMapPk` has value.
	     * @param {joi.SchemaMap} _schemaMapId Rule to validate model PK.
	     */
	    protected constructor(_schemaMap: joi.SchemaMap, _isCompositePk: boolean, requirePk: boolean, _schemaMapPk?: joi.SchemaMap);
	    readonly schemaMap: joi.SchemaMap;
	    readonly schemaMapPk: joi.SchemaMap;
	    readonly isCompoundPk: boolean;
	    /**
	     * Validates model PK.
	     */
	    pk(pk: any): [ValidationError, any];
	    /**
	     * Validates model for creation operation, which doesn't need `pk` property.
	     */
	    whole(target: any, options?: ValidationOptions): [ValidationError, T];
	    /**
	     * Validates model for modification operation, which requires `pk` property.
	     */
	    partial(target: any, options?: ValidationOptions): [ValidationError, Partial<T>];
	    /**
	     * Must call this method before using `whole` or `partial`,
	     * or after `schemaMap` or `schemaMapId` is changed.
	     */
	    compile(): void;
	    protected validate(schema: joi.ObjectSchema, target: any, options?: ValidationOptions): [ValidationError, T];
	}

}
declare module 'app/translators/ModelAutoMapper' {
	import { JoiModelValidator } from 'app/validators/JoiModelValidator';
	import { ValidationError } from 'app/validators/ValidationError';
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
	    protected ModelClass: new () => any;
	    protected _validator?: JoiModelValidator<T>;
	    /**
	     * Turns on or off model validation before translating.
	     * Is set to `true` if validator is passed to class constructor.
	     */
	    enableValidation: boolean;
	    /**
	     * @param {class} ModelClass The model class
	     * @param {JoiModelValidator} _validator The model validator. If specified, turn on `enableValidation`
	     */
	    constructor(ModelClass: new () => any, _validator?: JoiModelValidator<T>);
	    /**
	     * Gets validator.
	     */
	    readonly validator: JoiModelValidator<T>;
	    /**
	     * Copies properties from `sources` to dest then optionally validates
	     * the result (depends on `enableValidation`).
	     * If `enableValidation` is turned off, it works just like native `Object.assign()` function,
	     * therefore, use `Object.assign()` for better performance if validation is not needed.
	     * Note that it uses `partial()` internally, hence `required` validation is IGNORED.
	     *
	     * @throws {ValidationError}
	     */
	    merge(dest: Partial<T>, sources: Partial<T> | Partial<T>[], options?: MappingOptions): Partial<T>;
	    /**
	     * Validates then converts an object to type <T>.
	     * but ONLY properties with value are validated and copied.
	     * Note that `required` validation is IGNORED.
	     * @param {any | any[]} source An object or array of objects to be translated.
	     *
	     * @throws {ValidationError} If no `errorCallback` is provided.
	     */
	    partial(source: any | any[], options?: MappingOptions): Partial<T> & Partial<T>[];
	    /**
	     * Validates then converts an object to type <T>.
	     * ALL properties are validated and copied regardless with or without value.
	     * @param {any | any[]} source An object or array of objects to be translated.
	     *
	     * @throws {ValidationError} If no `errorCallback` is provided.
	     */
	    whole(source: any | any[], options?: MappingOptions): T & T[];
	    /**
	     * Initializes the model mapping engine.
	     */
	    protected createMap(): void;
	    /**
	     * Is invoked after source object is validated to map source object to target model.
	     */
	    protected map(source: any): T;
	    	    	}

}
declare module 'app/models/settings/SettingItem' {
	import { ModelAutoMapper } from 'app/translators/ModelAutoMapper';
	import { JoiModelValidator } from 'app/validators/JoiModelValidator';
	export enum SettingItemDataType {
	    /**
	     * Text data type, that is rendered as a text box on UI.
	     */
	    String = "string",
	    /**
	     * Array of strings.
	     */
	    StringArray = "string[]",
	    /**
	     * Numeric data type including integer and float, that is rendered as
	     * a numeric box on UI.
	     */
	    Number = "number",
	    /**
	     * Array of numbers.
	     */
	    NumberArray = "number[]",
	    /**
	     * Logical data type (true/false), that is rendered as a checkbox on UI.
	     */
	    Boolean = "boolean"
	}
	/**
	 * Represents a setting record.
	 */
	export class SettingItem {
	    static validator: JoiModelValidator<SettingItem>;
	    static translator: ModelAutoMapper<SettingItem>;
	    /**
	     * Gets or sets setting name (aka setting key).
	     * This is also the key in `appconfig.json` and the name of environment variable.
	     */
	    readonly name: string;
	    /**
	     * Gets or sets data type of setting value.
	     * Must be one of: 'string', 'string[]', 'number', 'number[]', 'boolean'.
	     */
	    readonly dataType: SettingItemDataType;
	    /**
	     * Gets or set value.
	     * Whatever `dataType` is, value must always be string.
	     */
	    readonly value: string;
	}

}
declare module 'app/interfaces/configurations' {
	import { Maybe } from 'app/models/Maybe';
	import { SettingItemDataType } from 'app/models/settings/SettingItem';
	/**
	 * Stores a database connection detail.
	 */
	export type DbConnectionDetail = {
	    /**
	     * Database driver name, should use constants in class DbClient.
	     * Eg: DbClient.SQLITE3, DbClient.POSTGRESQL, ...
	     */
	    clientName: string;
	    /**
	     * Connection string for specified `clientName`.
	     */
	    connectionString?: string;
	    /**
	     * Absolute path to database file name.
	     */
	    filePath?: string;
	    host?: {
	        /**
	         * IP Address or Host name.
	         */
	        address: string;
	        /**
	         * Username to login database.
	         */
	        user: string;
	        /**
	         * Password to login database.
	         */
	        password: string;
	        /**
	         * Database name.
	         */
	        database: string;
	    };
	};
	export type CacheConnectionDetail = {
	    /**
	         * Address of remote cache service.
	         */
	    host?: string;
	    /**
	     * Port of remote cache service.
	     */
	    port?: number;
	};
	export interface IConfigurationProvider extends IServiceAddOn {
	    /**
	     * Turns on or off remote settings fetching.
	     */
	    enableRemote: boolean;
	    /**
	     * Attempts to get settings from remote Configuration Service, environmental variables,
	     * and `appconfig.json` file, respectedly.
	     * @param {string} key Setting key
	     * @param {SettingItemDataType} dataType Data type to parse some settings from file or ENV variables.
	     * 		Has no effect with remote settings.
	     */
	    get(key: string, dataType?: SettingItemDataType): Maybe<number | boolean | string>;
	    /**
	     * Attempts to fetch settings from remote Configuration Service.
	     */
	    fetch(): Promise<boolean>;
	    /**
	     * Invokes everytime new settings are updated.
	     * The callback receives an array of changed setting keys.
	     */
	    onUpdate(listener: (changedKeys: string[]) => void): void;
	}

}
declare module 'app/models/settings/CacheSettings' {
	import { /*IConfigurationProvider,*/ CacheConnectionDetail } from 'app/interfaces/configurations';
	import { SettingItem } from 'app/models/settings/SettingItem';
	/**
	 * Represents an array of cache settings.
	 */
	export class CacheSettings extends Array<SettingItem> {
	    	    constructor();
	    /**
	     * Gets number of connection settings.
	     */
	    readonly total: number;
	    /**
	     * Parses then adds a server detail to setting item array.
	     */
	    pushServer(detail: CacheConnectionDetail): void;
	}

}
declare module 'app/models/settings/DatabaseSettings' {
	import { /*IConfigurationProvider,*/ DbConnectionDetail } from 'app/interfaces/configurations';
	import { Maybe } from 'app/models/Maybe';
	import { SettingItem } from 'app/models/settings/SettingItem';
	/**
	 * Represents an array of database settings.
	 */
	export class DatabaseSettings extends Array<SettingItem> {
	    /**
	     * Parses from configuration provider.
	     * @param {IConfigurationProvider} provider.
	     */
	    /**
	     * Parses from connection detail.
	     * @param {DbConnectionDetail} detail Connection detail loaded from JSON data source.
	     */
	    static fromConnectionDetail(detail: DbConnectionDetail): Maybe<DatabaseSettings>;
	    constructor();
	}

}
declare module 'app/models/settings/GetSettingRequest' {
	import { ModelAutoMapper } from 'app/translators/ModelAutoMapper';
	import { JoiModelValidator } from 'app/validators/JoiModelValidator';
	/**
	 * Represents the request contract for GetSetting endpoint.
	 */
	export class GetSettingRequest {
	    static validator: JoiModelValidator<GetSettingRequest>;
	    static translator: ModelAutoMapper<GetSettingRequest>;
	    /**
	     * Gets or sets program slug.
	     */
	    readonly slug: string;
	    /**
	     * Gets or sets IP address where the calling program is running.
	     */
	    readonly ipAddress: string;
	}

}
declare module 'app/models/PagedArray' {
	/**
	 * A wrapper array that contains paged items.
	 */
	export class PagedArray<T> extends Array<T> {
	    	    /**
	     * Gets total number of items.
	     */
	    readonly total: number;
	    constructor(total?: number, ...items: T[]);
	    /**
	     * Returns a serializable object.
	     */
	    asObject(): {
	        total: number;
	        data: any[];
	    };
	}

}
declare module 'app/index' {
	import 'bluebird-global';
	import constantObj = require('app/constants/index');
	export const constants: constantObj.Constants;
	export * from 'app/interfaces/configurations';
	export * from 'app/models/settings/CacheSettings';
	export * from 'app/models/settings/DatabaseSettings';
	export * from 'app/models/settings/GetSettingRequest';
	export * from 'app/models/settings/SettingItem';
	export * from 'app/models/Exceptions';
	export * from 'app/models/Maybe';
	export * from 'app/models/PagedArray';
	export * from 'app/translators/ModelAutoMapper';
	export * from 'app/validators/JoiModelValidator';
	export * from 'app/validators/ValidationError';
	export * from 'app/DependencyContainer';
	export * from 'app/HandlerContainer';
	export * from 'app/Guard';
	export * from 'app/Types';

}
declare module 'test/DependencyContainer.spec' {
	export {};

}
declare module 'test/Exceptions.spec' {
	export {};

}
declare module 'test/Guard.spec' {
	export {};

}
declare module 'test/HandlerContainer.spec' {
	export {};

}
declare module 'test/PagedArray.spec' {
	export {};

}
declare module 'test/models/CacheSettings.spec' {
	export {};

}
declare module 'test/models/DatabaseSettings.spec' {
	export {};

}
declare module 'test/models/GetSettingRequest.spec' {
	export {};

}
declare module 'test/models/SettingItem.spec' {
	export {};

}
declare module 'test/validators/SampleModel' {
	import { JoiModelValidator } from 'app';
	export class SampleModel {
	    static validator: JoiModelValidator<SampleModel>;
	    readonly theID: number;
	    readonly name: string;
	    readonly address: string;
	    readonly age: number;
	    readonly gender: 'male' | 'female';
	}

}
declare module 'test/translators/ModelAutoMapper.spec' {
	export {};

}
declare module 'test/validators/JoiModelValidator.spec' {
	export {};

}
