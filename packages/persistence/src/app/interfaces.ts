import * as knex from 'knex';
import { PagedArray } from '@micro-fleet/common-contracts';

import { AtomicSession } from './atom/AtomicSession';


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
export interface ISoftDelRepository<TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk>
		extends IRepository<TModel, TPk, TUk> {

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
export interface IVersionRepository<TModel extends IVersionControlled, TPk extends PkType = BigInt, TUk = NameUk>
		extends ISoftDelRepository<TModel, TPk, TUk> {

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
	restrictQuantity(pk: TPk, nVersion: number, options?: RepositoryRestrictOptions);
}