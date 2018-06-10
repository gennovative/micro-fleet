import 'reflect-metadata';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as shortid from 'shortid';
import { injectable, DependencyContainer, MinorException } from '@micro-fleet/common';

import { MessageBrokerRpcHandler, IMessage, IMessageBrokerConnector, IMediateRpcHandler,
	TopicMessageBrokerConnector, IRpcRequest, IRpcResponse } from '../app';

import rabbitOpts from './rabbit-options';

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


let depContainer: DependencyContainer,
	handlerMbConn: IMessageBrokerConnector,
	callerMbConn: IMessageBrokerConnector,
	handler: IMediateRpcHandler;

describe('MediateRpcHandler', function () {
	this.timeout(10000);

	describe('init', () => {
		it('Should do nothing', () => {
			// Arrange
			let handler = new MessageBrokerRpcHandler(
				new DependencyContainer(),
				new TopicMessageBrokerConnector()
			);

			// Act
			handler.module = MODULE;
			handler.name = NAME;
			handler.init();

			// Assert
			expect(handler.module).to.equal(MODULE);
		});
		
		it('Should raise error if problems occur', done => {
			// Arrange
			const ERROR = 'Test error';

			handlerMbConn = new TopicMessageBrokerConnector();
			handler = new MessageBrokerRpcHandler(
				new DependencyContainer(),
				handlerMbConn
			);

			// Act
			handler.module = MODULE;
			handler.name = NAME;
			handler.init();
			handler.onError(err => {
				// Assert
				expect(err).to.equal(ERROR);
				handlerMbConn.disconnect().then(() => done());
			});

			handlerMbConn.connect(rabbitOpts.handler)
				.then(() => {
					handlerMbConn['_emitter'].emit('error', ERROR);
				});
		});

	}); // END describe 'init'

	describe('handle', function() {
		// Uncomment this to have longer time to step debug.
		//this.timeout(30000);
		
		beforeEach(done => {
			depContainer = new DependencyContainer();
			callerMbConn = new TopicMessageBrokerConnector();
			handlerMbConn = new TopicMessageBrokerConnector();
			handler = new MessageBrokerRpcHandler(depContainer, handlerMbConn);
			
			handlerMbConn.onError((err) => {
				console.error('Handler error:\n' + JSON.stringify(err));
			});
			
			callerMbConn.onError((err) => {
				console.error('Caller error:\n' + JSON.stringify(err));
			});

			handler.module = MODULE;
			handler.name = NAME;
			Promise.all([
				handlerMbConn.connect(rabbitOpts.handler),
				callerMbConn.connect(rabbitOpts.caller)
			])
			.then(() => { done(); });
		});

		afterEach(async function() {
			this.timeout(5000);
			depContainer.dispose();
			await handler.dispose();
			await handlerMbConn.deleteQueue();
			await Promise.all([
				handlerMbConn.disconnect(),
				callerMbConn.disconnect()
			]);
		});

		it('Should subscribe topic pattern on message broker.', (done) => {
			// Arrange
			const ACTION = 'echo',
				TEXT = 'eeeechooooo';

			depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_NORM);

			// Assert
			let replyTo = `response.${MODULE}.${ACTION}@${Math.random()}`;

			callerMbConn.subscribe(replyTo)
				.then(() => callerMbConn.listen((msg: IMessage) => {
					let response: IRpcResponse = msg.data;
					expect(response).to.exist;
					expect(response.isSuccess).to.be.true;
					expect(response.payload).to.equal(TEXT);
					done();
				}))
				.then(() => handler.start())
				.then(() => {
					let req: IRpcRequest = {
						from: MODULE,
						to: '',
						payload: {
							text: TEXT
						}
					};
					let topic = `request.${MODULE}.${ACTION}`;
					// Manually publish request.
					callerMbConn.publish(topic, req, 
						{ correlationId: shortid.generate(), replyTo }
					);
				});

		});

		it('Should handle multiple actions.', (done) => {
			// Arrange
			const TEXT = 'eeeechooooo',
				responseSpy = chai.spy(),
				replyToOne = `response.${MODULE}.addProduct@${Math.random()}`,
				replyToTwo = `response.${MODULE}.remove@${Math.random()}`,
				replyToThree = `response.${MODULE}.echo@${Math.random()}`
				;

			depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

			// Act
			handler.handle('addProduct', CONTROLLER_NORM)
				.then(() => {
					return handler.handle(['remove', 'echo'], CONTROLLER_NORM);
				})
				.then(() => {
					return Promise.all([
						callerMbConn.subscribe(replyToOne),
						callerMbConn.subscribe(replyToTwo),
						callerMbConn.subscribe(replyToThree)
					]);
				})
				.then(() => callerMbConn.listen((msg: IMessage) => {
					// Assert
					let response: IRpcResponse = msg.data,
						{ routingKey } = msg.raw.fields;
					expect(response).to.exist;
					expect(response.isSuccess).to.be.true;

					if (routingKey.includes('addProduct')) {
						expect(response.payload).to.equal(SUCCESS_ADD_PRODUCT);
						responseSpy.call(null, SUCCESS_ADD_PRODUCT);
					} else if (routingKey.includes('remove')) {
						expect(response.payload).to.equal(SUCCESS_DEL_PRODUCT);
						responseSpy.call(null, SUCCESS_DEL_PRODUCT);
					} else if (routingKey.includes('echo')) {
						expect(response.payload).to.equal(TEXT);
						responseSpy.call(null, TEXT);
					}
				}))
				.then(() => handler.start())
				.then(() => {
					let req: IRpcRequest = {
						from: MODULE,
						to: '',
						payload: {
							text: TEXT
						}
					};

					// Manually publish requests.
					return Promise.all([
						callerMbConn.publish(`request.${MODULE}.addProduct`, req, 
							{ correlationId: shortid.generate(), replyTo: replyToOne }),
						callerMbConn.publish(`request.${MODULE}.remove`, req, 
							{ correlationId: shortid.generate(), replyTo: replyToTwo }),
						callerMbConn.publish(`request.${MODULE}.echo`, req, 
							{ correlationId: shortid.generate(), replyTo: replyToThree })
					]);
				})
				.then(() => {
					setTimeout(() => {
						expect(responseSpy).to.be.called.exactly(3);
						expect(responseSpy).to.be.called.with(SUCCESS_ADD_PRODUCT);
						expect(responseSpy).to.be.called.with(SUCCESS_DEL_PRODUCT);
						expect(responseSpy).to.be.called.with(TEXT);
						done();
					}, 1000);
				});

		});

		it('Should respond with falsey result and InternalErrorException if controller rejects.', (done) => {
			// Arrange
			const ACTION = 'addProduct',
				spy = chai.spy();
			
			depContainer.bind<ErrorProductController>(CONTROLLER_ERR, ErrorProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_ERR);

			handler.onError(err => {
				expect(err).to.exist;
				spy();
			});

			// Assert
			let replyTo = `response.${MODULE}.${ACTION}@${Math.random()}`;

			callerMbConn.subscribe(replyTo)
				.then(() => callerMbConn.listen((msg: IMessage) => {
					let response: IRpcResponse = msg.data;
					expect(response).to.be.not.null;
					expect(response.isSuccess).to.be.false;
					expect(response.payload.type).to.equal('InternalErrorException');
					expect(spy).to.be.called.once;
					done();
				}))
				.then(() => handler.start())
				.then(() => {
					let req: IRpcRequest = {
						from: MODULE,
						to: '',
						payload: {}
					};
					let topic = `request.${MODULE}.${ACTION}`;
					// Manually publish response.
					callerMbConn.publish(topic, req, 
						{ correlationId: shortid.generate(), replyTo }
					);
				});
		});

		it('Should respond with falsey result and error object if controller throws Exception', (done) => {
			// Arrange
			const ACTION = 'deleteProduct';

			depContainer.bind<ErrorProductController>(CONTROLLER_ERR, ErrorProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_ERR, controller => controller.remove);

			// Assert
			let replyTo = `response.${MODULE}.${ACTION}@${Math.random()}`;

			callerMbConn.subscribe(replyTo)
				.then(() => callerMbConn.listen((msg: IMessage) => {
					let response: IRpcResponse = msg.data;
					expect(response).to.be.not.null;
					expect(response.isSuccess).to.be.false;
					expect(response.payload.type).to.equal('MinorException');
					expect(response.payload.message).to.equal(ERROR_DEL_PRODUCT);
					done();
				}))
				.then(() => handler.start())
				.then(() => {
					let req: IRpcRequest = {
						from: MODULE,
						to: '',
						payload: {}
					};
					let topic = `request.${MODULE}.${ACTION}`;
					// Manually publish response.
					callerMbConn.publish(topic, req, 
						{ correlationId: shortid.generate(), replyTo });
				});
		});

		it('Should respond with falsey result and InternalErrorException if there is internal Error.', (done) => {
			// Arrange
			const ACTION = 'editProduct',
			spy = chai.spy();

			depContainer.bind<ErrorProductController>(CONTROLLER_ERR, ErrorProductController);

			// Act
			handler.handle(ACTION, CONTROLLER_ERR, (controller: ErrorProductController) => controller.edit);

			handler.onError(err => {
				expect(err).to.exist;
				spy();
			});

			// Assert
			let replyTo = `response.${MODULE}.${ACTION}@${Math.random()}`;

			callerMbConn.subscribe(replyTo)
				.then(() => callerMbConn.listen((msg: IMessage) => {
					let response: IRpcResponse = msg.data;
					expect(response).to.be.not.null;
					expect(response.isSuccess).to.be.false;
					expect(response.payload.type).to.equal('InternalErrorException');
					expect(spy).to.be.called.once;
					done();
				}))
				.then(() => handler.start())
				.then(() => {
					let req: IRpcRequest = {
						from: MODULE,
						to: '',
						payload: {}
					};
					let topic = `request.${MODULE}.${ACTION}`;
					// Manually publish response.
					callerMbConn.publish(topic, req, 
						{ correlationId: shortid.generate(), replyTo });
				});
		});

	}); // END describe 'handle'
});