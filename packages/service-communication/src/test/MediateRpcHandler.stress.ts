import 'reflect-metadata';
import * as shortid from 'shortid';
import { injectable, DependencyContainer } from '@micro-fleet/common';

import { MessageBrokerRpcHandler, IMessage,
	TopicMessageBrokerConnector, IRpcRequest } from '../app';

import rabbitOpts from './rabbit-options';


const MODULE = 'TestHandler',
	CONTROLLER_NORM = Symbol('NormalProductController'),
	SUCCESS_ADD_PRODUCT = 'addProductOk',
	SUCCESS_DEL_PRODUCT = 'removeOk';


@injectable()
class NormalProductController {
	public addProduct(request: IRpcRequest, resolve: PromiseResolveFn, reject: PromiseRejectFn): void {
		resolve(SUCCESS_ADD_PRODUCT);
		console.log('Product added!');
	}

	public remove(request: IRpcRequest, resolve: PromiseResolveFn, reject: PromiseRejectFn): void {
		resolve(SUCCESS_DEL_PRODUCT);
		console.log('Product deleted!');
	}

	public echo(request: IRpcRequest, resolve: PromiseResolveFn, reject: PromiseRejectFn): void {
		resolve(request.payload['text']);
	}
}


let depContainer: DependencyContainer,
	handlerMbConn: TopicMessageBrokerConnector,
	callerMbConn: TopicMessageBrokerConnector,
	handler: MessageBrokerRpcHandler;

describe.skip('MediateRpcHandler', function() {
	// Disable timeout to let stress test run forever.
	this.timeout(0);

	// MediateRpcHandler.spec.js
	// MessageBrokerAdapter.js

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

			handler.name = MODULE;
			Promise.all([
				handlerMbConn.connect(rabbitOpts.handler),
				callerMbConn.connect(rabbitOpts.caller)
			])
			.then(() => { done(); });
	});

	afterEach(done => {
		depContainer.dispose();
		Promise.all([
				handlerMbConn.disconnect(),
				callerMbConn.disconnect()
			])
		.then(() => { done(); });
	});

	it('Should handle requests as much as it could.', (done) => {
		// Arrange
		const ACTION = 'echo',
			TEXT = 'eeeechooooo';
		
		depContainer.bind<NormalProductController>(CONTROLLER_NORM, NormalProductController);

		// Act
		handler.handle(ACTION, CONTROLLER_NORM);

		// Assert
		let replyTo = `response.${MODULE}.${ACTION}`,
			start: number, end: number;
		
		callerMbConn.subscribe(replyTo)
			.then(() => {
				return handlerMbConn.listen((msg: IMessage) => {
					end = new Date().getTime();
					console.log(`Response after ${end - start}ms`);
				});
			}).then(() => {
				let req: IRpcRequest = {
					from: MODULE,
					to: '',
					payload: {
						text: TEXT
					}
				};

				const SENDING_GAP = 100; //ms
				setInterval(() => {
					// Manually publish request.
					start = new Date().getTime();
					console.log('Request');
					callerMbConn.publish(`request.${MODULE}.${ACTION}`, req, { correlationId: shortid.generate(), replyTo });
				}, SENDING_GAP); // END setInterval
			});

	});
});