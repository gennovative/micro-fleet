import { QueryBuilder, QueryBuilderSingle } from 'objection';

import * as it from '../interfaces';
import { IQueryBuilder } from './IQueryBuilder';
import { EntityBase } from './EntityBase';


export class VersionQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType, TUk = NameUk> 
	implements IQueryBuilder<TEntity, TModel, TPk, TUk> {

	constructor(private _EntityClass) {
	}


	public buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryCountAllOptions): QueryBuilder<TEntity> {
		return prevQuery.where('is_main', true);
	}

	public buildDeleteHard(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number> {
		return rawQuery.deleteById(this.toArr(pk, this._EntityClass.idProp));
	}

	public buildExists(props: TUk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryExistsOptions): QueryBuilder<TEntity> {
		return prevQuery.where('is_main', true);
	}

	public buildFind(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryFindOptions = {}): QueryBuilder<TEntity> {
		let q = rawQuery.findById(this.toArr(pk, this._EntityClass.idProp));
		if (opts.version) {
			q = q.where('version', opts.version);
		} else {
			q = q.where('is_main', true);
		}
		return q;
	}

	public buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPageOptions): QueryBuilder<TEntity> {
		return prevQuery.where('is_main', true);
	}

	public buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number> {
		return <any>rawQuery.patch(entity).whereComposite(this._EntityClass.idColumn, '=', this.toArr(entity, this._EntityClass.idProp)).where('is_main', true);
	}

	public buildRecoverOpts(pk: TPk, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions {
		return prevOpts;
	}

	public buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts: it.RepositoryPatchOptions): QueryBuilder<number> {
		return <any>rawQuery.update(entity).whereComposite(this._EntityClass.idColumn, '=', this.toArr(entity, this._EntityClass.idProp)).where('is_main', true);
	}


	private toArr(pk: TPk | TEntity | Partial<TEntity>, arr: any[]): any[] {
		return arr.map(c => pk[c]);
	}
}