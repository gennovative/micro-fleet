const every = require('lodash/every');
const isEmpty = require('lodash/isEmpty');
import { QueryBuilder, QueryBuilderSingle } from 'objection';
import * as moment from 'moment';
import { injectable, unmanaged, Guard, MinorException } from '@micro-fleet/common-util';
import { PagedArray } from '@micro-fleet/common-contracts';

import * as it from '../interfaces';
import { AtomicSessionFactory } from '../atom/AtomicSessionFactory';
import { IDatabaseConnector, QueryCallback } from '../connector/IDatabaseConnector';
import { EntityBase } from './EntityBase';
import { MonoProcessor, ProcessorOptions } from './MonoProcessor';
import { BatchProcessor } from './BatchProcessor';
import { VersionControlledProcessor } from './VersionControlledProcessor';

export interface RepositoryBaseOptions<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk>
		extends ProcessorOptions {
	/**
	 * Whether this repository supports processing multiple rows in an operations.
	 * If you want to save a little bit performance and you are sure that you always process
	 * one row at a time, turn this to `false`.
	 * Default to true.
	 */
	isBatchSupport?: boolean;
}


@injectable()
export abstract class RepositoryBase<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType = BigInt, TUk = NameUk>
	implements it.ISoftDelRepository<TModel, TPk, TUk> {

	protected _processor: BatchProcessor<TEntity, TModel, TPk, TUk>;
	protected _options: RepositoryBaseOptions<TEntity, TModel, TPk, TUk>;

	constructor( @unmanaged() private _EntityClass: typeof EntityBase, @unmanaged() private _dbConnector: IDatabaseConnector,
			@unmanaged() _options: RepositoryBaseOptions<TEntity, TModel, TPk, TUk> = {}) {
		Guard.assertArgDefined('EntityClass', _EntityClass);
		Guard.assertArgDefined('dbConnector', _dbConnector);

		_options = this._options = Object.assign({
			isMultiTenancy: false,
			isVersionControlled: false,
			triggerProps: [],
			isBatchSupport: true
		}, _options);
		let processor: any = new MonoProcessor<TEntity, TModel, TPk, TUk>(_EntityClass, _dbConnector, _options);
		// TODO: Should let `VersionControlledProcessor` accepts `MonoProcessor` as argument.
		_options.isVersionControlled && (processor = new VersionControlledProcessor<TEntity, TModel, TPk, TUk>(_EntityClass, _dbConnector, _options));
		_options.isBatchSupport && (processor = new BatchProcessor<TEntity, TModel, TPk, TUk>(processor, _dbConnector));

		this._processor = processor;
	}


	/**
	 * @see IRepository.countAll
	 */
	public async countAll(opts: it.RepositoryCountAllOptions = {}): Promise<number> {
		return this._processor.countAll(opts);
	}

	/**
	 * @see IRepository.create
	 */
	public create(model: TModel | TModel[], opts: it.RepositoryCreateOptions = {}): Promise<TModel & TModel[]> {
		return this._processor.create(model, opts);
	}

	/**
	 * @see ISoftDelRepository.deleteSoft
	 */
	public deleteSoft(pk: TPk | TPk[], opts: it.RepositoryDeleteOptions = {}): Promise<number> {
		return this._processor.deleteSoft(pk, opts);
	}

	/**
	 * @see IRepository.deleteHard
	 */
	public deleteHard(pk: TPk | TPk[], opts: it.RepositoryDeleteOptions = {}): Promise<number> {
		return this._processor.deleteHard(pk, opts);
	}

	/**
	 * @see IRepository.exists
	 */
	public async exists(props: TUk, opts: it.RepositoryExistsOptions = {}): Promise<boolean> {
		return this._processor.exists(props, opts);
	}

	/**
	 * @see IRepository.findByPk
	 */
	public findByPk(pk: TPk, opts: it.RepositoryFindOptions = {}): Promise<TModel> {
		return this._processor.findByPk(pk, opts);
	}

	/**
	 * @see IRepository.page
	 */
	public async page(pageIndex: number, pageSize: number, opts: it.RepositoryPageOptions = {}): Promise<PagedArray<TModel>> {
		return this._processor.page(pageIndex, pageSize, opts);
	}

	/**
	 * @see IRepository.patch
	 */
	public patch(model: Partial<TModel> | Partial<TModel>[], opts: it.RepositoryPatchOptions = {}): Promise<Partial<TModel> & Partial<TModel>[]> {
		return this._processor.patch(model, opts);
	}

	/**
	 * @see ISoftDelRepository.recover
	 */
	public async recover(pk: TPk | TPk[], opts: it.RepositoryRecoverOptions = {}): Promise<number> {
		return this._processor.recover(pk, opts);
	}

	/**
	 * @see IRepository.update
	 */
	public update(model: TModel | TModel[], opts: it.RepositoryUpdateOptions = {}): Promise<TModel & TModel[]> {
		return this._processor.update(model, opts);
	}
}