const every = require('lodash/every');
const isEmpty = require('lodash/isEmpty');
import { QueryBuilder, QueryBuilderSingle } from 'objection';
import * as moment from 'moment';
import { MinorException } from '@micro-fleet/common-util';

import * as it from '../interfaces';
import { AtomicSessionFactory } from '../atom/AtomicSessionFactory';
import { IDatabaseConnector, QueryCallback } from '../connector/IDatabaseConnector';
import { EntityBase } from './EntityBase';
import { MonoProcessor, ProcessorOptions } from './MonoProcessor';
import { VersionQueryBuilder } from './VersionQueryBuilder';


export class VersionControlledProcessor<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType, TUk = NameUk> 
	extends MonoProcessor<TEntity, TModel, TPk, TUk> {

	private _triggerProps: string[];
	private _atomFac: AtomicSessionFactory;

	constructor(EntityClass,
			dbConnector: IDatabaseConnector,
			options: ProcessorOptions = {}) {
		super(EntityClass, dbConnector, options);
		this._triggerProps = options.triggerProps;
		this._queryBuilders.push(new VersionQueryBuilder<TEntity, TModel, TPk, TUk>(EntityClass));
		this._atomFac = new AtomicSessionFactory(dbConnector);
	}


	public create(model: TModel, opts: it.RepositoryCreateOptions = {}): Promise<TModel & TModel[]> {
		let entity: TEntity = this.toEntity(model, false);
		if (!entity['version']) {
			entity['version'] = model['version'] = 1;
		}

		return this.executeQuery(query => query.insert(entity), opts.atomicSession)
			.then(() => <any>model);
	}

	public patch(model: Partial<TModel>, opts: it.RepositoryPatchOptions = {}): Promise<Partial<TModel> & Partial<TModel>[]> {
		if (this.isIntersect(Object.keys(model), this._triggerProps)) {
			return <any>this.saveAsNew(null, model);
		}
		return super.patch.apply(this, arguments);
	}

	public update(model: TModel, opts: it.RepositoryUpdateOptions = {}): Promise<TModel & TModel[]> {
		if (this.isIntersect(Object.keys(model), this._triggerProps)) {
			return <any>this.saveAsNew(null, model);
		}
		return super.update.apply(this, arguments);
	}


	private async saveAsNew(pk: TPk, updatedModel: TModel | Partial<TModel>): Promise<TModel> {
		let source: TModel = await this.findByPk(pk || <any>updatedModel);
		if (!source) { return null; }

		let flow = this._atomFac.startSession();
		flow
			.pipe(s => {
				updatedModel['isMain'] = false;
				return super.patch(updatedModel);
			})
			.pipe(s => {
				let clone = Object.assign({}, source, updatedModel, { version: source['version'] + 1 });
				return this.create(clone);
			});
		return flow.closePipe();
	}

	private isIntersect(arr1: any[], arr2: any[]): boolean {
		for (let a of arr1) {
			if (arr2.includes(a)) {
				return true;
			}
		}
		return false;
	}
}