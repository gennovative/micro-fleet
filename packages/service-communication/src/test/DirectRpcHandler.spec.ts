import 'reflect-metadata';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as express from 'express';
import * as requestMaker from 'request-promise';
import { inject, injectable, DependencyContainer, MinorException, Exception,
	InternalErrorException } from '@micro-fleet/common-util';

import { ExpressRpcHandler, IDirectRpcHandler, IRpcRequest, IRpcResponse } from '../app';

chai.use(spies);
const expect = chai.expect;


const MODULE = 'TestModule',
	NAME = 'TestHandler',
	CONTROLLER_NORM = Symbol('NormalProductController'),
	CONTROLLER_ERR = Symbol('ErrorProductController'),
	SUCCESS_ADD_PRODUCT = 'addProductOk',
	SUCCESS_DEL_PRODUCT = 'removeOk',
	ERROR_ADD_PRODUCT = 'addProductError',
	ERROR_DEL_PRODUCT = 'removeException',
	ERROR_EDIT_PRODUCT = 'editError'
	;

@injectable()
class NormalProductController {
	public addProduct(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
		resolve(SUCCESS_ADD_PRODUCT);
		// console.log('Product added!');
	}

	public remove(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
		resolve(SUCCESS_DEL_PRODUCT);
		// console.log('Product deleted!');
	}

	public echo(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
		resolve(requestPayload['text']);
	}
}

@injectable()
class ErrorProductController {
	public addProduct(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
		reject(ERROR_ADD_PRODUCT);
		// console.log('Product adding failed!');
	}

	public edit(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): void {
		// console.log('Product editing failed!');
		throw new Error(ERROR_EDIT_PRODUCT);
	}

	public remove(requestPayload: any, resolve: PromiseResolveFn, reject: PromiseRejectFn, rawRequest: IRpcRequest): Promise<any> {
		return new Promise((resolve, reject) => {
			// console.log('Product deleting failed!');
			throw new MinorException(ERROR_DEL_PRODUCT);
		});
	}
}

describe('ExpressDirectRpcHandler', () => {
	describe('init', () => {
		it('Should use provided express and router instances', () => {
			// Arrange
			let handler = new ExpressRpcHandler(new DependencyContainer()),
				app = express(),
				router = express.Router();

			// Act
			handler.module = MODULE;
			handler.name = NAME;
			handler.init({
				expressApp: app,
				expressRouter: router
			});

			// Assert
			expect(handler['_app']).to.equal(app);
			expect(handler['_router']).to.equal(router);
		});

		it('Should use `name` property to init Router', () => {
			// Arrange
			let handler = new ExpressRpcHandler(new DependencyContainer());

			// Act
			handler.module = MODULE;
			handler.name = NAME;
			handler.init();

			// Assert
			let app: express.Express = handler['_app'];
			expect(app._router.stack).to.be.not.null;

			let router = app._router.stack.find(entry => entry.name == 'router');
			expect(router).to.be.not.null;

			expect(`/${MODULE}`).to.match(router.regexp);
			expect(`/${handler.module}`).to.match(router.regexp);
		});
	});

	describe('start', () => {
		it('Should raise error if problems occur', done => {
			// Arrange
			let handler = new ExpressRpcHandler(new DependencyContainer()),
				app = express();

				handler.module = MODULE;
				handler.name = NAME;
			handler.init({
				expressApp: app,
				expressRouter: express.Router()
			});

			// Start this server to make a port conflict
			let server = app.listen(handler.port, () => {

				handler.onError(err => {
					// Assert
					expect(err).to.exist;
					server.close(() => done());
				});

				// Act
				handler.start();
			});
		});
	});

	describe('handle', () => {
		let depContainer: DependencyContainer,
			handler: ExpressRpcHandler;

		beforeEach(() => {
			depContainer = new DependencyContainer();
			handler = new ExpressRpcHandler(depContainer);
			handler.module = MODULE;
			handler.name = NAME;
			handler.init();
		});

		afterEach(async () => {
			depContainer.dispose();
			await handler.dispose();
		});

		it('Should add a route path in case action name is same with method name.', done => {
			// Arrange
			const ACTION = 'addProduct';

			depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_NORM);

			// Assert
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];
			expect(router.stack[0].route.path).to.equal(`/${ACTION}`);

			handler.start()
				.then(() => {
					let options: requestMaker.Options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: {},
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						expect(res.from).to.equal(NAME);
						expect(res.payload).to.equal(SUCCESS_ADD_PRODUCT);
						done();
					})
					.catch(rawResponse => {
						console.error(rawResponse.error);
						expect(rawResponse.error).not.to.exist;
					});
				});
		});

		it('Should add a route path in case action name is resolved by factory.', done => {
			// Arrange
			const ACTION = 'deleteProduct';

			depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];
			handler.handle(ACTION, CONTROLLER_NORM, (controller: NormalProductController) => controller.remove.bind(controller));

			// Assert
			expect(router.stack[0].route.path).to.equal(`/${ACTION}`);

			handler.start()
				.then(() => {
					let options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: {},
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						expect(res.from).to.equal(NAME);
						expect(res.payload).to.equal(SUCCESS_DEL_PRODUCT);
						done();
					})
					.catch(rawResponse => {
						console.error(rawResponse.error);
					});
				});
		});

		it('Should parse and pass request parameters to action method.', done => {
			// Arrange
			const ACTION = 'echo',
				TEXT = 'echo...echooooo';

			depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];
			handler.handle(ACTION, CONTROLLER_NORM);

			// Assert
			handler.start()
				.then(() => {
					let request: IRpcRequest = {
						from: '',
						to: MODULE,
						payload: {
							text: TEXT
						}
					},
					options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: request,
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						expect(res.payload).to.equal(TEXT);
						done();
					})
					.catch(rawResponse => {
						console.error(rawResponse.error);
						expect(true, 'Request should be successful!').to.be.false;
					});
				});
		});

		it('Should respond with status 500 and InternalErrorException if controller rejects a string.', done => {
			// Arrange
			const ACTION = 'addProduct',
				spy = chai.spy();

			depContainer.bind<ErrorProductController>(CONTROLLER_ERR, ErrorProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_ERR);

			// Assert
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];

			handler.onError(err => {
				expect(err).to.exist;
				spy();
			});

			handler.start()
				.then(() => {
					let options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: {},
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						expect(res, 'Request should not be successful!').not.to.exist;
					})
					.catch(rawResponse => {
						expect(rawResponse.statusCode).to.equal(500);
						expect(rawResponse.error.payload.type).to.equal('InternalErrorException');
						expect(spy).to.be.called.once;
						done();
					});
				});
		});

		it('Should respond with status 500 and exception object if controller throws Exception.', done => {
			// Arrange
			const ACTION = 'deleteProduct';

			depContainer.bind<ErrorProductController>(CONTROLLER_ERR, ErrorProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_ERR, (controller: ErrorProductController) => controller.remove.bind(controller));

			// Assert
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];

			handler.start()
				.then(() => {
					let options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: {},
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						// If status 200
						expect(res, 'Request should NOT be successful!').not.to.exist;
					})
					.catch(rawResponse => {
						// If status 500 or request error.
						expect(rawResponse.statusCode).to.equal(500);
						expect(rawResponse.error.payload.type).to.equal('MinorException');
						expect(rawResponse.error.payload.message).to.equal(ERROR_DEL_PRODUCT);
						done();
					});
				});
		});

		it('Should respond with status 500 and InternalErrorException if controller throws Error.', done => {
			// Arrange
			const ACTION = 'editProduct',
				spy = chai.spy();

			depContainer.bind<ErrorProductController>(CONTROLLER_ERR, ErrorProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_ERR, (controller: ErrorProductController) => controller.edit.bind(controller));

			// Assert
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];

			handler.onError(err => {
				expect(err).to.exist;
				spy();
			});

			handler.start()
				.then(() => {
					let options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: {},
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						// If status 200
						expect(res, 'Request should NOT be successful!').not.to.exist;
					})
					.catch(rawResponse => {
						// If status 500 or request error.
						expect(rawResponse.statusCode).to.equal(500);
						expect(rawResponse.error.payload.type).to.equal('InternalErrorException');
						expect(spy).to.be.called.once;
						done();
					});
				});
		});
		
		it('Should respond with status 500 and InternalErrorException if registered controller cannot be resolved.', done => {
			// Arrange
			const ACTION = 'addProduct',
				spy = chai.spy();

			// Intentionally not binding controller
			//depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];
			handler.handle(ACTION, CONTROLLER_NORM);

			handler.onError(err => {
				expect(err).to.exist;
				spy();
			});

			handler.start()
				.then(() => {
					let request: IRpcRequest = {
						from: '',
						to: MODULE,
						payload: {}
					},
					options = {
						method: 'POST',
						uri: `http://localhost:${handler.port}/${MODULE}/${ACTION}`,
						body: request,
						json: true
					};

					requestMaker(options).then((res: IRpcResponse) => {
						// If status 200
						expect(true, 'Request should NOT be successful!').to.be.false;
					})
					.catch(rawResponse => {
						// Assert
						expect(rawResponse.statusCode).to.equal(500);
						expect(rawResponse.error.payload.type).to.equal('InternalErrorException');
						expect(spy).to.be.called.once;
						done();
					});
				});
		});

		it('Should respond with status 500 and InternalErrorException if specified action does not exist in controller.', done => {
			// Arrange
			const UNEXIST_ACTION = 'editProduct',
				spy = chai.spy();

			depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			let app: express.Express = handler['_app'],
				router: express.Router = handler['_router'];
			handler.handle(UNEXIST_ACTION, CONTROLLER_NORM);

			handler.onError(err => {
				expect(err).to.exist;
				spy();
			});

			handler.start()
				.then(() => {
					let request: IRpcRequest = {
							from: '',
							to: MODULE,
							payload: {}
						},
						options = {
							method: 'POST',
							uri: `http://localhost:${handler.port}/${MODULE}/${UNEXIST_ACTION}`,
							body: request,
							json: true
						};

					requestMaker(options).then((res: IRpcResponse) => {
						// If status 200
						expect(true, 'Request should NOT be successful!').to.be.false;
					})
					.catch(rawResponse => {
						// Assert
						expect(rawResponse.statusCode).to.equal(500);
						expect(rawResponse.error.payload.type).to.equal('InternalErrorException');
						expect(spy).to.be.called.once;
						done();
					});
				});
		});

	}); // END describe handle
});