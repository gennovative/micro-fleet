import { QueryBuilder, QueryBuilderSingle } from 'objection';

import * as it from '../interfaces';
import { EntityBase } from './EntityBase';


export interface IQueryBuilder<TEntity extends EntityBase, TModel extends IModelDTO, TPk extends PkType, TUk = NameUk>  {
	buildCountAll(prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryCountAllOptions): QueryBuilder<TEntity>;

	buildDeleteHard(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>): QueryBuilderSingle<number>;

	buildExists(uniqVals: any, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryExistsOptions): QueryBuilder<TEntity>;

	buildFind(pk: TPk, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryFindOptions): QueryBuilder<TEntity>;

	buildPage(pageIndex: number, pageSize: number, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPageOptions): QueryBuilder<TEntity>;

	buildPatch(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPatchOptions): QueryBuilder<number>;

	buildRecoverOpts(pk: TPk, prevOpts: it.RepositoryRecoverOptions, rawOpts: it.RepositoryRecoverOptions): it.RepositoryExistsOptions;

	buildUpdate(entity: TEntity, prevQuery: QueryBuilder<TEntity>, rawQuery: QueryBuilder<TEntity>, opts?: it.RepositoryPatchOptions): QueryBuilder<number>;
}