/// <reference path="./global.d.ts" />

declare module '@micro-fleet/common-contracts/dist/app/Types' {
	export class Types {
	    static readonly CONFIG_PROVIDER: string;
	    static readonly DEPENDENCY_CONTAINER: string;
	}

}
declare module '@micro-fleet/common-contracts/dist/app/models/AtomicSession' {
	/**
	 * Wraps a database connection and transaction.
	 */
	export class AtomicSession {
	    knexConnection: any;
	    knexTransaction: any;
	    constructor(knexConnection: any, knexTransaction: any);
	}

}
declare module '@micro-fleet/common-contracts/dist/app/models/PagedArray' {
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
declare module '@micro-fleet/common-contracts/dist/app/constants/setting-keys/cache' {
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
	    CACHE_PORT = "db_port_",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/validators/ValidationError' {
	import * as joi from 'joi';
	import { MinorException } from '@micro-fleet/common-util';
	/**
	 * Represents a validation error for a property.
	 * UI Form should use this information to highlight the particular input.
	 */
	export interface IValidationErrorItem {
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
	}
	/**
	 * Represents an error when a model does not pass validation.
	 */
	export class ValidationError extends MinorException {
	    readonly details: IValidationErrorItem[];
	    constructor(joiDetails: joi.ValidationErrorItem[]);
	    	}

}
declare module '@micro-fleet/common-contracts/dist/app/validators/JoiModelValidator' {
	import * as joi from 'joi';
	import { ValidationError } from '@micro-fleet/common-contracts/dist/app/validators/ValidationError';
	export interface ValidationOptions extends joi.ValidationOptions {
	}
	export class JoiModelValidator<T> {
	    protected _schemaMap: joi.SchemaMap;
	    protected _isCompositePk: boolean;
	    protected _schemaMapPk: joi.SchemaMap;
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
declare module '@micro-fleet/common-contracts/dist/app/translators/ModelAutoMapper' {
	import { JoiModelValidator } from '@micro-fleet/common-contracts/dist/app/validators/JoiModelValidator';
	import { ValidationError } from '@micro-fleet/common-contracts/dist/app/validators/ValidationError';
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
	    protected _validator: JoiModelValidator<T>;
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
declare module '@micro-fleet/common-contracts/dist/app/models/settings/SettingItem' {
	import { ModelAutoMapper } from '@micro-fleet/common-contracts/dist/app/translators/ModelAutoMapper';
	import { JoiModelValidator } from '@micro-fleet/common-contracts/dist/app/validators/JoiModelValidator';
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
	    Boolean = "boolean",
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
declare module '@micro-fleet/common-contracts/dist/app/interfaces/configurations' {
	import { SettingItemDataType } from '@micro-fleet/common-contracts/dist/app/models/settings/SettingItem';
	/**
	 * Stores a database connection detail.
	 */
	export interface IDbConnectionDetail {
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
	}
	export interface ICacheConnectionDetail {
	    /**
	         * Address of remote cache service.
	         */
	    host?: string;
	    /**
	     * Port of remote cache service.
	     */
	    port?: number;
	}
	export interface IConfigurationProvider extends IServiceAddOn {
	    /**
	     * Turns on or off remote settings fetching.
	     */
	    enableRemote: boolean;
	    /**
	     * Attempts to get settings from cached Configuration Service, environmetal variable,
	     * and `appconfig.json` file, respectedly.
	     * @param {string} key Setting key
	     * @param {SettingItemDataType} dataType Data type to parse some settings from file or ENV variables.
	     * 		Has no effect with remote settings.
	     */
	    get(key: string, dataType?: SettingItemDataType): number & boolean & string;
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
declare module '@micro-fleet/common-contracts/dist/app/models/settings/CacheSettings' {
	import { IConfigurationProvider, ICacheConnectionDetail } from '@micro-fleet/common-contracts/dist/app/interfaces/configurations';
	import { SettingItem } from '@micro-fleet/common-contracts/dist/app/models/settings/SettingItem';
	/**
	 * Wraps an array of database settings.
	 */
	export class CacheSettings extends Array<SettingItem> {
	    static fromProvider(provider: IConfigurationProvider): ICacheConnectionDetail[];
	    	    constructor();
	    /**
	     * Gets number of connection settings.
	     */
	    readonly total: number;
	    /**
	     * Parses then adds connection detail to setting item array.
	     */
	    pushConnection(detail: ICacheConnectionDetail): void;
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/setting-keys/database' {
	export enum DbSettingKeys {
	    /**
	     * Number of database connections.
	     * Data type: number
	     */
	    DB_NUM_CONN = "db_num_conn",
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
	    DB_HOST = "db_host_",
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
	    DB_CONN_STRING = "db_connStr_",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/models/settings/DatabaseSettings' {
	import { IConfigurationProvider, IDbConnectionDetail } from '@micro-fleet/common-contracts/dist/app/interfaces/configurations';
	import { SettingItem } from '@micro-fleet/common-contracts/dist/app/models/settings/SettingItem';
	/**
	 * Wraps an array of database settings.
	 */
	export class DatabaseSettings extends Array<SettingItem> {
	    static fromProvider(provider: IConfigurationProvider): IDbConnectionDetail[];
	    	    	    constructor();
	    /**
	     * Gets number of connection settings.
	     */
	    readonly total: number;
	    /**
	     * Parses then adds connection detail to setting item array.
	     */
	    pushConnection(detail: IDbConnectionDetail): void;
	}

}
declare module '@micro-fleet/common-contracts/dist/app/models/settings/GetSettingRequest' {
	import { ModelAutoMapper } from '@micro-fleet/common-contracts/dist/app/translators/ModelAutoMapper';
	import { JoiModelValidator } from '@micro-fleet/common-contracts/dist/app/validators/JoiModelValidator';
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
declare module '@micro-fleet/common-contracts/dist/app/constants/DbClient' {
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
	    SQLITE3 = "sqlite3",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/ports' {
	export enum ServicePorts {
	    SETTINGS = 50100,
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/names/actions' {
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
	    UPDATE = "update",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/names/modules' {
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
	    TENANT_CONFIGURATION = "tenantConfig",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/setting-keys/message-broker' {
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
	    MSG_BROKER_MSG_EXPIRE = "msgBroker_msg_expr",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/setting-keys/rpc' {
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
	    RPC_HANDLER_PORT = "rpc_handler_port",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/setting-keys/service' {
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
	    SERVICE_SLUG = "service_slug",
	}

}
declare module '@micro-fleet/common-contracts/dist/app/constants/index' {
	import { DbClient } from '@micro-fleet/common-contracts/dist/app/constants/DbClient';
	import { ServicePorts } from '@micro-fleet/common-contracts/dist/app/constants/ports';
	import { ActionNames } from '@micro-fleet/common-contracts/dist/app/constants/names/actions';
	import { ModuleNames } from '@micro-fleet/common-contracts/dist/app/constants/names/modules';
	import { CacheSettingKeys } from '@micro-fleet/common-contracts/dist/app/constants/setting-keys/cache';
	import { DbSettingKeys } from '@micro-fleet/common-contracts/dist/app/constants/setting-keys/database';
	import { MbSettingKeys } from '@micro-fleet/common-contracts/dist/app/constants/setting-keys/message-broker';
	import { RpcSettingKeys } from '@micro-fleet/common-contracts/dist/app/constants/setting-keys/rpc';
	import { SvcSettingKeys } from '@micro-fleet/common-contracts/dist/app/constants/setting-keys/service';
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
declare module '@micro-fleet/common-contracts' {
	export * from '@micro-fleet/common-contracts/dist/app/models/AtomicSession';
	export * from '@micro-fleet/common-contracts/dist/app/models/PagedArray';
	export * from '@micro-fleet/common-contracts/dist/app/models/settings/CacheSettings';
	export * from '@micro-fleet/common-contracts/dist/app/models/settings/DatabaseSettings';
	export * from '@micro-fleet/common-contracts/dist/app/models/settings/GetSettingRequest';
	export * from '@micro-fleet/common-contracts/dist/app/models/settings/SettingItem';
	export * from '@micro-fleet/common-contracts/dist/app/translators/ModelAutoMapper';
	export * from '@micro-fleet/common-contracts/dist/app/validators/JoiModelValidator';
	export * from '@micro-fleet/common-contracts/dist/app/validators/ValidationError';
	export * from '@micro-fleet/common-contracts/dist/app/interfaces/configurations';
	export * from '@micro-fleet/common-contracts/dist/app/Types';
	import constantObj = require('@micro-fleet/common-contracts/dist/app/constants/index');
	export const constants: constantObj.Constants;

}
