import * as express from 'express';

import { CacheProvider, CacheLevel, Types as CaT } from 'back-lib-cache-provider';
import { injectable, inject } from 'back-lib-common-util';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class TenantResolverFilter {

	private _tenants: Map<string, BigSInt>;
	constructor(
			@inject(CaT.CACHE_PROVIDER) protected _cache: CacheProvider,
			//@inject(GvT.TENANT_PROVIDER) protected _tenantProvider: ITenantProvider
		) {
		this._tenants = new Map<string, BigSInt>();
	}

	public async resolve(req: express.Request, res: express.Response, next: Function): Promise<void> {
		const { tenantSlug } = req.params;

		// Preserved slug, specially for system services.
		if (tenantSlug == '_') { 
			req.params['tenantId'] = null;
			return next();
		}

		let key = `common-web::tenant::${tenantSlug}`,
			tenantId: BigSInt;
		if (this._cache) {
			tenantId = await this._cache.getPrimitive(key, false, false) as BigSInt;
		} else {
			tenantId = this._tenants.get(tenantSlug);
		}

		if (tenantId) {
			console.log('TenantResolver: from cache');
			req.params['tenantId'] = tenantId;
			return next();
		}

		// let tenant = await this._tenantProvider.findBySlug(tenantSlug);
		// if (!tenant) { return null; }

		// Mocking
		let tenant = { id: Math.random() + '' };

		if (this._cache) {
			this._cache.setPrimitive(key, tenant.id, null, CacheLevel.BOTH);
		} else {
			this._tenants.set(tenantSlug, tenant.id);
		}
		console.log('TenantResolver: from repo');
		req.params['tenantId'] = tenant.id;
		next();
	}
}