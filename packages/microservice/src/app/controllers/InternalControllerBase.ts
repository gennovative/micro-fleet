import { ISoftDelRepository, JoiModelValidator, ModelAutoMapper } from 'back-lib-common-contracts';
import { injectable, unmanaged } from 'back-lib-common-util';
import { IdProvider } from 'back-lib-id-generator';
import { IRpcRequest } from 'back-lib-service-communication';


@injectable()
export abstract class InternalControllerBase<TModel extends IModelDTO> {
	constructor(
		@unmanaged() protected _ClassDTO?: Newable,
		@unmanaged() protected _repo?: ISoftDelRepository<TModel, any, any>,
		@unmanaged() protected _idProvider?: IdProvider
	) {
	}

	protected get validator(): JoiModelValidator<TModel> {
		return this._ClassDTO['validator'];
	}

	protected get translator(): ModelAutoMapper<TModel> {
		return this._ClassDTO['translator'];
	}


	public async countAll(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Counting model');
		let count = await this._repo.countAll(payload.options);
		resolve(count);
	}

	public async create(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Creating model');
		payload.model.id = payload.model.id || this._idProvider.nextBigInt().toString();
		let dto = this.translator.whole(payload.model);
		dto = await this._repo.create(dto, payload.options);
		resolve(dto);
	}

	public async deleteHard(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Hard deleting model');
		let pk = this.validator.pk(payload.pk),
			nRows = await this._repo.deleteHard(pk, payload.options);
		resolve(nRows);
	}

	public async deleteSoft(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Soft deleting model');
		let pk = this.validator.pk(payload.pk),
			nRows = await this._repo.deleteSoft(pk, payload.options);
		resolve(nRows);
	}

	public async exists(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Checking existence');
		let gotIt: boolean = await this._repo.exists(payload.props, payload.options);
		resolve(gotIt);
	}

	public async findByPk(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Finding model');
		let pk = this.validator.pk(payload.pk),
			foundDto: TModel = await this._repo.findByPk(pk, payload.options);
		resolve(foundDto);
	}

	public async recover(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Recovering model');
		let pk = this.validator.pk(payload.pk),
			nRows = await this._repo.recover(pk, payload.options);
		resolve(nRows);
	}

	public async page(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Paging model');
		let models = await this._repo.page(payload.pageIndex, payload.pageSize, payload.options);
		resolve(models);
	}

	public async patch(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Patching model');
		let model: Partial<TModel> = this.translator.partial(payload.model),
			updatedProps: Partial<TModel> = await this._repo.patch(model, payload.options);
		resolve(updatedProps);
	}

	public async update(payload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, request: IRpcRequest) {
		console.log('Updating model');
		let model: TModel = this.translator.whole(payload.model),
			updatedModel: TModel = await this._repo.update(model, payload.options);
		resolve(updatedModel);
	}
}