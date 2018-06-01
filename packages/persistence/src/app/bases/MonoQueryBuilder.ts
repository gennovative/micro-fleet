import { QueryBuilder, QueryBuilderSingle } from 'objection';

import * as it from '../interfaces';
import { IQueryBuilder } from './IQueryBuilder';
import { EntityBase } from './EntityBase';


export class MonoQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TUk = NameUk> 
	implements IQueryBuilder<TEntity, TModel, BigInt, TUk> {

	constructor(private _EntityClass: typeof EntityBase) {
	}


	public buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryCountAllOptions): QueryBuilder<TEntity> {
		let q = rawQuery.count('* as total');
		return (opts.includeDeleted === false) ? q.whereNull('deleted_at') : q;
	}

	public buildDeleteHard(pk: BigInt, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number> {
		return rawQuery.deleteById(<any>pk);
	}

	public buildExists(uniqVals: any[], prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryExistsOptions): QueryBuilder<TEntity> {
		let q = rawQuery.count('* as total');
			// .whereComposite(this._EntityClass.uniqColumn, '=', this.toArr(uniqVals, this._EntityClass.uniqColumn));
		if (uniqVals && uniqVals.length) {
			q = q.where(builder => {
				this._EntityClass.uniqColumn.forEach((c, i) => {
					let v = uniqVals[i];
					if (v === null) {
						builder.orWhereNull(c);
					} else if (v !== undefined) {
						builder.orWhere(c, '=', v);
					}
				});
			});
		}
		return (opts.includeDeleted === false) ? q.whereNull('deleted_at') : q;
	}

	public buildFind(pk: BigInt, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryFindOptions = {}): QueryBuilder<TEntity> {
		return <any>rawQuery.findById(<any>pk);
	}

	public buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPageOptions): QueryBuilder<TEntity> {
		let q = rawQuery.page(pageIndex, pageSize);
		if (opts.sortBy) {
			let direction = opts.sortType || 'asc';
			q = q.orderBy(opts.sortBy, direction);
		}
		return (opts.includeDeleted === false) ? q.whereNull('deleted_at') : q;
	}

	public buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number> {
		const idProp = this._EntityClass.idProp[0];
		return rawQuery.patch(entity).where(idProp, entity[idProp]);
	}

	public buildRecoverOpts(pk: BigInt, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions {
		return {
			includeDeleted: true,
		};
	}

	public buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number> {
		const idProp = this._EntityClass.idProp[0];
		return rawQuery.update(entity).where(idProp, entity[idProp]);
	}


}