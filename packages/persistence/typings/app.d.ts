/// <reference path="./global.d.ts" />

declare module '@micro-fleet/persistence/dist/app/atom/AtomicSession' {
	import * as objection from 'objection';
	import { KnexConnection } from '@micro-fleet/persistence/dist/app/interfaces';
	/**
	 * Wraps a database connection and transaction.
	 */
	export class AtomicSession {
	    connection: KnexConnection;
	    transaction: objection.Transaction;
	    constructor(connection: KnexConnection, transaction: objection.Transaction);
	}

}
declare module '@micro-fleet/persistence/dist/app/interfaces' {
	/// <reference types="knex" />
	import * as knex from 'knex';
	import { PagedArray } from '@micro-fleet/common-contracts';
	import { AtomicSession } from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	export interface KnexConnection extends knex {
	}
	/**
	 * Options for repository's operations.
	 * Note that different operations care about different option properties.
	 * @deprecated
	 */
	export interface RepositoryOptions {
	    /**
	     * A transaction to which this operation is restricted.
	     */
	    atomicSession?: AtomicSession;
	    /**
	     * Account ID.
	     */
	    accountId?: BigInt;
	}
	export interface RepositoryExistsOptions extends RepositoryOptions {
	    /**
	     * Whether to include records marked as soft-deleted.
	     * Default to `false`.
	     */
	    includeDeleted?: boolean;
	    /**
	     * Tenant ID.
	     */
	    tenantId?: BigInt;
	}
	export interface RepositoryCountAllOptions extends RepositoryExistsOptions {
	}
	export interface RepositoryCreateOptions extends RepositoryOptions {
	}
	export interface RepositoryDeleteOptions extends RepositoryOptions {
	}
	export interface RepositoryFindOptions extends RepositoryOptions {
	    version?: number;
	}
	export interface RepositoryPageOptions extends RepositoryCountAllOptions {
	    sortBy?: string;
	    sortType?: string;
	}
	export interface RepositoryPatchOptions extends RepositoryOptions {
	}
	export interface RepositoryRecoverOptions extends RepositoryOptions {
	}
	export interface RepositoryUpdateOptions extends RepositoryOptions {
	}
	export interface RepositorySetMainOptions extends RepositoryOptions {
	}
	export interface RepositoryDelVersionOptions extends RepositoryOptions {
	    olderThan?: Date;
	}
	export interface RepositoryRestrictOptions extends RepositoryOptions {
	}
	/**
	 * Provides common CRUD operations, based on Unit of Work pattern.
	 */
	export interface IRepository<TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk> {
	    /**
	     * Counts all records in a table.
	     */
	    countAll(options?: RepositoryCountAllOptions): Promise<number>;
	    /**
	     * Inserts one or more `model` to database.
	     * @param {DTO model} model The model to be inserted.
	     */
	    create(model: TModel | TModel[], options?: RepositoryCreateOptions): Promise<TModel & TModel[]>;
	    /**
	     * Permanently deletes one or many records.
	     * @param {PK Type} pk The primary key object.
	     */
	    deleteHard(pk: TPk | TPk[], options?: RepositoryDeleteOptions): Promise<number>;
	    /**
	     * Checks if a record exists or not.
	     * @param {TUk} props An object with non-primary unique properties.
	     */
	    exists(props: TUk, options?: RepositoryExistsOptions): Promise<boolean>;
	    /**
	     * Selects only one record with `pk`.
	     * @param {PK Type} pk The primary key object.
	     */
	    findByPk(pk: TPk, options?: RepositoryFindOptions): Promise<TModel>;
	    /**
	     * Selects `pageSize` number of records at page `pageIndex`.
	     * @param {number} pageIndex Index of the page.
	     * @param {number} pageSize Number of records in a page.
	     */
	    page(pageIndex: number, pageSize: number, options?: RepositoryPageOptions): Promise<PagedArray<TModel>>;
	    /**
	     * Updates new value for specified properties in `model`.
	     */
	    patch(model: Partial<TModel> | Partial<TModel>[], options?: RepositoryPatchOptions): Promise<Partial<TModel> & Partial<TModel>[]>;
	    /**
	     * Replaces a record with `model`.
	     */
	    update(model: TModel | TModel[], options?: RepositoryUpdateOptions): Promise<TModel & TModel[]>;
	}
	/**
	 * Provides common operations to soft-delete and recover models.
	 */
	export interface ISoftDelRepository<TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk> extends IRepository<TModel, TPk, TUk> {
	    /**
	     * Marks one or many records with `pk` as deleted.
	     * @param {PK Type} pk The primary key object.
	     */
	    deleteSoft(pk: TPk | TPk[], options?: RepositoryDeleteOptions): Promise<number>;
	    /**
	     * Marks one or many records with `pk` as NOT deleted.
	     * @param {PK Type} pk The primary key object.
	     */
	    recover(pk: TPk | TPk[], options?: RepositoryRecoverOptions): Promise<number>;
	}
	/**
	 * Provides common operations to control models' revisions.
	 */
	export interface IVersionRepository<TModel extends IVersionControlled, TPk extends PkType = BigInt, TUk = NameUk> extends ISoftDelRepository<TModel, TPk, TUk> {
	    /**
	     * Permanently deletes one or many version of a record.
	     * Can be filtered with `olderThan` option.
	     * @param {PK Type} pk The primary key object.
	     */
	    deleteHardVersions(pk: TPk, versions: number | number[], options?: RepositoryDelVersionOptions): Promise<number>;
	    /**
	     * Selects `pageSize` number of version of a record at page `pageIndex`.
	     * @param {PK Type} pk The primary key object.
	     * @param {number} pageIndex Index of the page.
	     * @param {number} pageSize Number of records in a page.
	     */
	    pageVersions(pk: TPk, pageIndex: number, pageSize: number, options?: RepositoryPageOptions): Promise<number>;
	    /**
	     * Marks a revision as main version of the record with `pk`.
	     * @param {PK Type} pk The primary key object.
	     * @param {number} version The version number.
	     */
	    setAsMain(pk: TPk, version: number, options?: RepositorySetMainOptions): Promise<number>;
	    /**
	     * Removes old versions to keep number of version to be equal or less than `nVersion`.
	     * @param {PK Type} pk The primary key object.
	     * @param {number} nVersion Number of versions to keep.
	     */
	    restrictQuantity(pk: TPk, nVersion: number, options?: RepositoryRestrictOptions): any;
	}

}
declare module '@micro-fleet/persistence/dist/app/bases/EntityBase' {
	import { Model } from 'objection';
	export abstract class EntityBase extends Model {
	    /**
	     * @abstract
	     */
	    static readonly tableName: string;
	    /**
	     * [ObjectionJS] Array of primary column names.
	     */
	    static readonly idColumn: string[];
	    /**
	     * An array of non-primary unique column names.
	     */
	    static readonly uniqColumn: any[];
	    /**
	     * Same with `idColumn`, but transform snakeCase to camelCase.
	     * Should be overriden (['id', 'tenantId']) for composite PK.
	     */
	    static readonly idProp: string[];
	    /**
	     * This is called when an object is serialized to database format.
	     */
	    $formatDatabaseJson(json: any): any;
	    /**
	     * This is called when an object is read from database.
	     */
	    $parseDatabaseJson(json: any): object;
	}

}
declare module '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector' {
	import { QueryBuilder } from 'objection';
	import { IDbConnectionDetail } from '@micro-fleet/common-contracts';
	import { KnexConnection } from '@micro-fleet/persistence/dist/app/interfaces';
	import { AtomicSession } from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	/**
	 * Invoked when a request for getting query is replied.
	 * @param {QueryBuilder} queryBuilder A query that is bound to a connection.
	 * @param {Class extends Model} boundEntityClass A class that is bound to a connection.
	 */
	export type QueryCallback<TEntity> = (queryBuilder: QueryBuilder<TEntity>, boundEntityClass?) => Promise<any>;
	/**
	 * Helps with managing multiple database connections and executing same query with all
	 * of those connections.
	 */
	export interface IDatabaseConnector {
	    /**
	     * Gets the established database connection.
	     */
	    connection: KnexConnection;
	    /**
	     * Creates a new database connection.
	     * @param {IConnectionDetail} detail Credentials to make connection.
	     */
	    init(detail: IDbConnectionDetail): void;
	    /**
	     * Closes all connections and destroys this connector.
	     */
	    dispose(): Promise<void>;
	    /**
	     * Executes same query on all managed connections. This connector binds connections
	     * to `EntityClass` and passes a queryable instance to `callback`.
	     *
	     * @param {class} EntityClass An entity class to bind a connection.
	     * @param {QueryCallback} callback A callback to invoke each time a connection is bound.
	     * @param {AtomicSession} atomicSession A session which provides transaction to execute queries on.
	     * @example
	     * 	connector.init({...});
	     * 	const result = await connector.prepare(AccountEntity, (query) => {
	     * 		return query.insert({ name: 'Example' })
	     * 	});
	     *
	     * @return {Promise} A promise returned by the `callback`.
	     */
	    prepare<TEntity extends EntityBase>(EntityClass: any, callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any>;
	}

}
declare module '@micro-fleet/persistence/dist/app/Types' {
	export class Types {
	    static readonly DB_ADDON: string;
	    static readonly DB_CONNECTOR: string;
	    static readonly ATOMIC_SESSION_FACTORY: string;
	}

}
declare module '@micro-fleet/persistence/dist/app/DatabaseAddOn' {
	import { IConfigurationProvider } from '@micro-fleet/common-contracts';
	import { IDatabaseConnector } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	/**
	 * Initializes database connections.
	 */
	export class DatabaseAddOn implements IServiceAddOn {
	    	    	    constructor(_configProvider: IConfigurationProvider, _dbConnector: IDatabaseConnector);
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
	    	    	}

}
declare module '@micro-fleet/persistence/dist/app/convert-utc' {
	export {};

}
declare module '@micro-fleet/persistence/dist/app/atom/AtomicSessionFlow' {
	import { IDatabaseConnector } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	import { AtomicSession } from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	export type SessionTask = (session: AtomicSession, previousOutput?: any) => Promise<any>;
	/**
	 * Provides method to execute queries on many database connections, but still make
	 * sure those queries are wrapped in transactions.
	 */
	export class AtomicSessionFlow {
	    protected _dbConnector: IDatabaseConnector;
	    	    	    	    	    	    	    /**
	     *
	     * @param {string[]} names Only executes the queries on connections with specified names.
	     */
	    constructor(_dbConnector: IDatabaseConnector, names: string[]);
	    /**
	     * Checks if it is possible to call "pipe()".
	     */
	    readonly isPipeClosed: boolean;
	    /**
	     * Returns a promise which resolves to the output of the last query
	     * on primary (first) connection.
	     * This method must be called at the end of the pipe chain.
	     */
	    closePipe(): Promise<any>;
	    /**
	     * Adds a task to be executed inside transaction.
	     * This method is chainable and can only be called before `closePipe()` is invoked.
	     */
	    pipe(task: SessionTask): AtomicSessionFlow;
	    	    	    	    	    	}

}
declare module '@micro-fleet/persistence/dist/app/atom/AtomicSessionFactory' {
	import { IDatabaseConnector } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	import { AtomicSessionFlow } from '@micro-fleet/persistence/dist/app/atom/AtomicSessionFlow';
	/**
	 * Provides methods to create atomic sessions.
	 */
	export class AtomicSessionFactory {
	    protected _dbConnector: IDatabaseConnector;
	    constructor(_dbConnector: IDatabaseConnector);
	    /**
	     * Starts executing queries in transactions.
	     * @param {string[]} names Only executes the queries on connections with specified names.
	     */
	    startSession(...names: string[]): AtomicSessionFlow;
	}

}
declare module '@micro-fleet/persistence/dist/app/bases/IQueryBuilder' {
	import { QueryBuilder, QueryBuilderSingle } from 'objection';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	export interface IQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType, TUk = NameUk> {
	    buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryCountAllOptions): QueryBuilder<TEntity>;
	    buildDeleteHard(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number>;
	    buildExists(uniqVals: any, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryExistsOptions): QueryBuilder<TEntity>;
	    buildFind(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryFindOptions): QueryBuilder<TEntity>;
	    buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPageOptions): QueryBuilder<TEntity>;
	    buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPatchOptions): QueryBuilder<number>;
	    buildRecoverOpts(pk: TPk, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions;
	    buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPatchOptions): QueryBuilder<number>;
	}

}
declare module '@micro-fleet/persistence/dist/app/bases/MonoQueryBuilder' {
	import { QueryBuilder, QueryBuilderSingle } from 'objection';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { IQueryBuilder } from '@micro-fleet/persistence/dist/app/bases/IQueryBuilder';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	export class MonoQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TUk = NameUk> implements IQueryBuilder<TEntity, TModel, BigInt, TUk> {
	    	    constructor(_EntityClass: typeof EntityBase);
	    buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryCountAllOptions): QueryBuilder<TEntity>;
	    buildDeleteHard(pk: BigInt, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number>;
	    buildExists(uniqVals: any[], prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryExistsOptions): QueryBuilder<TEntity>;
	    buildFind(pk: BigInt, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryFindOptions): QueryBuilder<TEntity>;
	    buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPageOptions): QueryBuilder<TEntity>;
	    buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number>;
	    buildRecoverOpts(pk: BigInt, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions;
	    buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number>;
	}

}
declare module '@micro-fleet/persistence/dist/app/bases/TenantQueryBuilder' {
	import { QueryBuilder, QueryBuilderSingle } from 'objection';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { IQueryBuilder } from '@micro-fleet/persistence/dist/app/bases/IQueryBuilder';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	export class TenantQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TUk = NameUk> implements IQueryBuilder<TEntity, TModel, TenantPk, TUk> {
	    	    constructor(_EntityClass: typeof EntityBase);
	    buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryCountAllOptions): QueryBuilder<TEntity>;
	    buildDeleteHard(pk: TenantPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number>;
	    buildExists(props: TUk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryExistsOptions): QueryBuilder<TEntity>;
	    buildFind(pk: TenantPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryFindOptions): QueryBuilder<TEntity>;
	    buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPageOptions): QueryBuilder<TEntity>;
	    buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPatchOptions): QueryBuilder<number>;
	    buildRecoverOpts(pk: TenantPk, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions;
	    buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPatchOptions): QueryBuilder<number>;
	    	}

}
declare module '@micro-fleet/persistence/dist/app/bases/MonoProcessor' {
	import * as moment from 'moment';
	import { PagedArray } from '@micro-fleet/common-contracts';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { AtomicSession } from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	import { IDatabaseConnector, QueryCallback } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	import { IQueryBuilder } from '@micro-fleet/persistence/dist/app/bases/IQueryBuilder';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	export interface ProcessorOptions {
	    /**
	     * If false, the model's primary key is composed of only one ID column.
	     * If true, the model's primary key is composed of ID and TenantID column.
	     * Default to false.
	     */
	    isMultiTenancy?: boolean;
	    /**
	     * If true, a clone of the model is backed up whenever one of the trigger properties
	     * is modified.
	     * Default to false.
	     */
	    isVersionControlled?: boolean;
	    /**
	     * Only takes effect when `isVersionControlled` is true.
	     * Property names that triggers new version creation.
	     */
	    triggerProps?: string[];
	}
	export class MonoProcessor<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk> {
	    protected _EntityClass: any;
	    protected _dbConnector: IDatabaseConnector;
	    protected _options: ProcessorOptions;
	    /**
	     * Gets array of non-primary unique property(ies).
	     */
	    readonly ukCol: string[];
	    protected _queryBuilders: IQueryBuilder<TEntity, TModel, PkType, TUk>[];
	    constructor(_EntityClass: any, _dbConnector: IDatabaseConnector, _options?: ProcessorOptions);
	    /**
	     * Gets current date time in UTC.
	     */
	    readonly utcNow: moment.Moment;
	    /**
	     * @see IRepository.countAll
	     */
	    countAll(opts?: it.RepositoryCountAllOptions): Promise<number>;
	    /**
	     * @see IRepository.create
	     */
	    create(model: TModel, opts?: it.RepositoryCreateOptions): Promise<TModel & TModel[]>;
	    /**
	     * @see ISoftDelRepository.deleteSoft
	     */
	    deleteSoft(pk: TPk, opts?: it.RepositoryDeleteOptions): Promise<number>;
	    /**
	     * @see IRepository.deleteHard
	     */
	    deleteHard(pk: TPk, opts?: it.RepositoryDeleteOptions): Promise<number>;
	    /**
	     * @see IRepository.exists
	     */
	    exists(props: TUk, opts?: it.RepositoryExistsOptions): Promise<boolean>;
	    /**
	     * @see IRepository.findByPk
	     */
	    findByPk(pk: TPk, opts?: it.RepositoryFindOptions): Promise<TModel>;
	    /**
	     * @see IRepository.page
	     */
	    page(pageIndex: number, pageSize: number, opts?: it.RepositoryPageOptions): Promise<PagedArray<TModel>>;
	    /**
	     * @see IRepository.patch
	     */
	    patch(model: Partial<TModel>, opts?: it.RepositoryPatchOptions): Promise<Partial<TModel> & Partial<TModel>[]>;
	    /**
	     * @see ISoftDelRepository.recover
	     */
	    recover(pk: TPk, opts?: it.RepositoryRecoverOptions): Promise<number>;
	    /**
	     * @see IRepository.update
	     */
	    update(model: TModel, opts?: it.RepositoryUpdateOptions): Promise<TModel>;
	    /**
	     * Executing an query
	     */
	    executeQuery(callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any>;
	    /**
	     * Translates from DTO model(s) to entity model(s).
	     */
	    toEntity(dto: TModel | TModel[] | Partial<TModel>, isPartial: boolean): TEntity & TEntity[];
	    /**
	     * Translates from entity model(s) to DTO model(s).
	     */
	    toDTO(entity: TEntity | TEntity[] | Partial<TEntity>, isPartial: boolean): TModel & TModel[];
	    /**
	     * Maps from an array of columns to array of values.
	     * @param pk Object to get values from
	     * @param cols Array of column names
	     */
	    toArr(pk: TPk | TEntity | Partial<TEntity>, cols: string[]): any[];
	    /**
	     * @see IDatabaseConnector.query
	     */
	    protected prepare(callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any>;
	    protected buildDeleteState(pk: TPk, isDel: boolean): any;
	    protected setDeleteState(pk: TPk, isDel: boolean, opts?: it.RepositoryDeleteOptions): Promise<number>;
	}

}
declare module '@micro-fleet/persistence/dist/app/bases/BatchProcessor' {
	import * as moment from 'moment';
	import { PagedArray } from '@micro-fleet/common-contracts';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { AtomicSession } from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	import { IDatabaseConnector, QueryCallback } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	import { MonoProcessor } from '@micro-fleet/persistence/dist/app/bases/MonoProcessor';
	export class BatchProcessor<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk> {
	    protected _mono: MonoProcessor<TEntity, TModel, TPk, TUk>;
	    /**
	     * Gets array of non-primary unique property(ies).
	     */
	    ukCol: string[];
	    	    constructor(_mono: MonoProcessor<TEntity, TModel, TPk, TUk>, dbConnector: IDatabaseConnector);
	    /**
	     * Gets current date time in UTC.
	     */
	    readonly utcNow: moment.Moment;
	    /**
	     * @see IRepository.countAll
	     */
	    countAll(opts?: it.RepositoryCountAllOptions): Promise<number>;
	    /**
	     * @see IRepository.create
	     */
	    create(model: TModel | TModel[], opts?: it.RepositoryCreateOptions): Promise<TModel & TModel[]>;
	    /**
	     * @see ISoftDelRepository.deleteSoft
	     */
	    deleteSoft(pk: TPk | TPk[], opts?: it.RepositoryDeleteOptions): Promise<number>;
	    /**
	     * @see IRepository.deleteHard
	     */
	    deleteHard(pk: TPk | TPk[], opts?: it.RepositoryDeleteOptions): Promise<number>;
	    /**
	     * @see IRepository.exists
	     */
	    exists(props: TUk, opts?: it.RepositoryExistsOptions): Promise<boolean>;
	    /**
	     * @see IRepository.findByPk
	     */
	    findByPk(pk: TPk, opts?: it.RepositoryFindOptions): Promise<TModel>;
	    /**
	     * @see IRepository.page
	     */
	    page(pageIndex: number, pageSize: number, opts?: it.RepositoryPageOptions): Promise<PagedArray<TModel>>;
	    /**
	     * @see IRepository.patch
	     */
	    patch(model: Partial<TModel> | Partial<TModel>[], opts?: it.RepositoryPatchOptions): Promise<Partial<TModel> & Partial<TModel>[]>;
	    /**
	     * @see ISoftDelRepository.recover
	     */
	    recover(pk: TPk | TPk[], opts?: it.RepositoryRecoverOptions): Promise<number>;
	    /**
	     * @see IRepository.update
	     */
	    update(model: TModel | TModel[], opts?: it.RepositoryUpdateOptions): Promise<TModel & TModel[]>;
	    /**
	     * @see MonoProcessor.executeQuery
	     */
	    executeQuery(callback: QueryCallback<TEntity>, atomicSession?: AtomicSession, name?: string): Promise<any>;
	    /**
	     * Executes batch operation in transaction.
	     */
	    execBatch(inputs: any[], func: (m: any, opts?: it.RepositoryOptions) => any, opts?: it.RepositoryOptions): Promise<any>;
	    /**
	     * @see MonoProcessor.toEntity
	     */
	    toEntity(dto: TModel | TModel[] | Partial<TModel>, isPartial: boolean): TEntity & TEntity[];
	    /**
	     * @see MonoProcessor.toDTO
	     */
	    toDTO(entity: TEntity | TEntity[] | Partial<TEntity>, isPartial: boolean): TModel & TModel[];
	    /**
	     * Maps from an array of columns to array of values.
	     * @param pk Object to get values from
	     * @param cols Array of column names
	     */
	    toArr(pk: TPk | TEntity | Partial<TEntity>, cols: string[]): any[];
	}

}
declare module '@micro-fleet/persistence/dist/app/bases/VersionQueryBuilder' {
	import { QueryBuilder, QueryBuilderSingle } from 'objection';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { IQueryBuilder } from '@micro-fleet/persistence/dist/app/bases/IQueryBuilder';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	export class VersionQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType, TUk = NameUk> implements IQueryBuilder<TEntity, TModel, TPk, TUk> {
	    	    constructor(_EntityClass: any);
	    buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryCountAllOptions): QueryBuilder<TEntity>;
	    buildDeleteHard(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number>;
	    buildExists(props: TUk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryExistsOptions): QueryBuilder<TEntity>;
	    buildFind(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryFindOptions): QueryBuilder<TEntity>;
	    buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPageOptions): QueryBuilder<TEntity>;
	    buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number>;
	    buildRecoverOpts(pk: TPk, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions;
	    buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number>;
	    	}

}
declare module '@micro-fleet/persistence/dist/app/bases/VersionControlledProcessor' {
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { IDatabaseConnector } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	import { MonoProcessor, ProcessorOptions } from '@micro-fleet/persistence/dist/app/bases/MonoProcessor';
	export class VersionControlledProcessor<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType, TUk = NameUk> extends MonoProcessor<TEntity, TModel, TPk, TUk> {
	    	    	    constructor(EntityClass: any, dbConnector: IDatabaseConnector, options?: ProcessorOptions);
	    create(model: TModel, opts?: it.RepositoryCreateOptions): Promise<TModel & TModel[]>;
	    patch(model: Partial<TModel>, opts?: it.RepositoryPatchOptions): Promise<Partial<TModel> & Partial<TModel>[]>;
	    update(model: TModel, opts?: it.RepositoryUpdateOptions): Promise<TModel & TModel[]>;
	    	    	}

}
declare module '@micro-fleet/persistence/dist/app/bases/RepositoryBase' {
	import { PagedArray } from '@micro-fleet/common-contracts';
	import * as it from '@micro-fleet/persistence/dist/app/interfaces';
	import { IDatabaseConnector } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	import { ProcessorOptions } from '@micro-fleet/persistence/dist/app/bases/MonoProcessor';
	import { BatchProcessor } from '@micro-fleet/persistence/dist/app/bases/BatchProcessor';
	export interface RepositoryBaseOptions<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk> extends ProcessorOptions {
	    /**
	     * Whether this repository supports processing multiple rows in an operations.
	     * If you want to save a little bit performance and you are sure that you always process
	     * one row at a time, turn this to `false`.
	     * Default to true.
	     */
	    isBatchSupport?: boolean;
	}
	export abstract class RepositoryBase<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk> implements it.ISoftDelRepository<TModel, TPk, TUk> {
	    	    	    protected _processor: BatchProcessor<TEntity, TModel, TPk, TUk>;
	    protected _options: RepositoryBaseOptions<TEntity, TModel, TPk, TUk>;
	    constructor(_EntityClass: typeof EntityBase, _dbConnector: IDatabaseConnector, _options?: RepositoryBaseOptions<TEntity, TModel, TPk, TUk>);
	    /**
	     * @see IRepository.countAll
	     */
	    countAll(opts?: it.RepositoryCountAllOptions): Promise<number>;
	    /**
	     * @see IRepository.create
	     */
	    create(model: TModel | TModel[], opts?: it.RepositoryCreateOptions): Promise<TModel & TModel[]>;
	    /**
	     * @see ISoftDelRepository.deleteSoft
	     */
	    deleteSoft(pk: TPk | TPk[], opts?: it.RepositoryDeleteOptions): Promise<number>;
	    /**
	     * @see IRepository.deleteHard
	     */
	    deleteHard(pk: TPk | TPk[], opts?: it.RepositoryDeleteOptions): Promise<number>;
	    /**
	     * @see IRepository.exists
	     */
	    exists(props: TUk, opts?: it.RepositoryExistsOptions): Promise<boolean>;
	    /**
	     * @see IRepository.findByPk
	     */
	    findByPk(pk: TPk, opts?: it.RepositoryFindOptions): Promise<TModel>;
	    /**
	     * @see IRepository.page
	     */
	    page(pageIndex: number, pageSize: number, opts?: it.RepositoryPageOptions): Promise<PagedArray<TModel>>;
	    /**
	     * @see IRepository.patch
	     */
	    patch(model: Partial<TModel> | Partial<TModel>[], opts?: it.RepositoryPatchOptions): Promise<Partial<TModel> & Partial<TModel>[]>;
	    /**
	     * @see ISoftDelRepository.recover
	     */
	    recover(pk: TPk | TPk[], opts?: it.RepositoryRecoverOptions): Promise<number>;
	    /**
	     * @see IRepository.update
	     */
	    update(model: TModel | TModel[], opts?: it.RepositoryUpdateOptions): Promise<TModel & TModel[]>;
	}

}
declare module '@micro-fleet/persistence/dist/app/connector/KnexDatabaseConnector' {
	import { IDbConnectionDetail } from '@micro-fleet/common-contracts';
	import { KnexConnection } from '@micro-fleet/persistence/dist/app/interfaces';
	import { AtomicSession } from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	import { EntityBase } from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	import { IDatabaseConnector, QueryCallback } from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	/**
	 * Provides settings from package
	 */
	export class KnexDatabaseConnector implements IDatabaseConnector {
	    	    	    constructor();
	    /**
	     * @see IDatabaseConnector.connection
	     */
	    readonly connection: KnexConnection;
	    /**
	     * @see IDatabaseConnector.init
	     */
	    init(detail: IDbConnectionDetail): void;
	    /**
	     * @see IDatabaseConnector.dispose
	     */
	    dispose(): Promise<void>;
	    /**
	     * @see IDatabaseConnector.prepare
	     */
	    prepare<TEntity extends EntityBase>(EntityClass: any, callback: QueryCallback<TEntity>, atomicSession?: AtomicSession): Promise<any>;
	    	    	    	}

}
declare module '@micro-fleet/persistence' {
	import '@micro-fleet/persistence/dist/app/convert-utc';
	export * from '@micro-fleet/persistence/dist/app/atom/AtomicSessionFactory';
	export * from '@micro-fleet/persistence/dist/app/atom/AtomicSessionFlow';
	export * from '@micro-fleet/persistence/dist/app/atom/AtomicSession';
	export * from '@micro-fleet/persistence/dist/app/bases/BatchProcessor';
	export * from '@micro-fleet/persistence/dist/app/bases/EntityBase';
	export * from '@micro-fleet/persistence/dist/app/bases/IQueryBuilder';
	export * from '@micro-fleet/persistence/dist/app/bases/MonoProcessor';
	export * from '@micro-fleet/persistence/dist/app/bases/MonoQueryBuilder';
	export * from '@micro-fleet/persistence/dist/app/bases/RepositoryBase';
	export * from '@micro-fleet/persistence/dist/app/bases/TenantQueryBuilder';
	export * from '@micro-fleet/persistence/dist/app/bases/VersionControlledProcessor';
	export * from '@micro-fleet/persistence/dist/app/connector/IDatabaseConnector';
	export * from '@micro-fleet/persistence/dist/app/connector/KnexDatabaseConnector';
	export * from '@micro-fleet/persistence/dist/app/DatabaseAddOn';
	export * from '@micro-fleet/persistence/dist/app/interfaces';
	export * from '@micro-fleet/persistence/dist/app/Types';

}
