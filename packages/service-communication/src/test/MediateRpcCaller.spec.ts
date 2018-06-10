import 'reflect-metadata';
import { expect } from 'chai';
import { MinorException, InternalErrorException } from '@micro-fleet/common';

import { MessageBrokerRpcCaller, IMessage,
	TopicMessageBrokerConnector, IRpcRequest, IRpcResponse } from '../app';

import rabbitOpts from './rabbit-options';


const CALLER_MODULE = 'TestCaller',
	HANDLER_MODULE = 'TestHandler';


let handlerMbConn: TopicMessageBrokerConnector,
	callerMbConn: TopicMessageBrokerConnector,
	caller: MessageBrokerRpcCaller;

describe('MessageBrokerRpcCaller', function() {
	this.timeout(10000);
	
	describe('init', () => {
		it('Should do nothing', () => {
			// Arrange
			let caller = new MessageBrokerRpcCaller(new TopicMessageBrokerConnector());

			// Act
			caller.name = CALLER_MODULE;
			caller.init();

			// Assert
			expect(caller.name).to.equal(CALLER_MODULE);
		});

		it('Should raise error if problems occur', done => {
			// Arrange
			const ERROR = 'Test error';
			const callerMbConn = new TopicMessageBrokerConnector(),
				caller = new MessageBrokerRpcCaller(callerMbConn);

			// Act
			caller.name = CALLER_MODULE;
			caller.init();
			caller.onError(err => {
				// Assert
				expect(err).to.equal(ERROR);
				callerMbConn.disconnect().then(() => done());
			});

			callerMbConn.connect(rabbitOpts.caller)
				.then(() => {
					callerMbConn['_emitter'].emit('error', ERROR);
				});
		});

	}); // END describe 'init'
	
	describe('call', function() {
		// Uncomment this to have longer time to step debug.
		//this.timeout(30000);
		
		beforeEach(done => {
			callerMbConn = new TopicMessageBrokerConnector();
			handlerMbConn = new TopicMessageBrokerConnector();
			caller = new MessageBrokerRpcCaller(callerMbConn);
			
			handlerMbConn.onError((err) => {
				console.error('Handler error:\n' + JSON.stringify(err));
			});
			
			callerMbConn.onError((err) => {
				console.error('Caller error:\n' + JSON.stringify(err));
			});

			caller.name = CALLER_MODULE;
			Promise.all([
				handlerMbConn.connect(rabbitOpts.handler),
				callerMbConn.connect(rabbitOpts.caller)
			])
			.then(() => { done(); })
			.catch(console.error);
		});

		afterEach(async function() {
			this.timeout(5000);
			await handlerMbConn.stopListen();
			await Promise.all([
				handlerMbConn.deleteQueue(),
				caller.dispose()
			]);
			await Promise.all([
				handlerMbConn.disconnect(),
				callerMbConn.disconnect()
			]);
		});

		it('Should publish a topic pattern on message broker.', (done) => {
			// Arrange
			const ACTION = 'echo',
				TEXT = 'eeeechooooo';

			caller.timeout = 3000;

			// This is the topic that caller should make
			const topic = `request.${HANDLER_MODULE}.${ACTION}`;
			caller.init();

			handlerMbConn.subscribe(topic)
				.then(() => handlerMbConn.listen((msg: IMessage) => {
					const request: IRpcRequest = msg.data;
				
					// Assert
					expect(request).to.be.not.null;
					expect(request.from).to.equal(CALLER_MODULE);
					expect(request.to).to.equal(HANDLER_MODULE);
					expect(request.payload.text).to.equal(TEXT);
					done();
				}))
				// Act
				.then(() => caller.call(HANDLER_MODULE, ACTION, { text: TEXT }))
				.catch(err => {
					if (err.message == 'Response waiting timeout') { return; }
					console.error(err);
					expect(err).not.to.exist;
				});
		});

		it('Should publish then wait for response.', (done) => {
			// Arrange
			const ACTION = 'echo',
				TEXT = 'eeeechooooo';

			// This is the topic that caller should make
			const topic = `request.${HANDLER_MODULE}.${ACTION}`;
			caller.init();

			handlerMbConn.subscribe(topic)
				.then(() => {
					return handlerMbConn.listen((msg: IMessage) => {
						const request: IRpcRequest = msg.data,
							props = msg.properties,
							response: IRpcResponse = {
								isSuccess: true,
								from: request.to,
								to: request.from,
								payload: {
									text: TEXT
								}
							};
						handlerMbConn.publish(props.replyTo, response, { correlationId: props.correlationId });
					});
				}).then(() => {
					// Act
					return caller.call(HANDLER_MODULE, ACTION);
				})
				.then((res: IRpcResponse) => {
					// Assert
					expect(res).to.be.not.null;
					expect(res.from).to.equal(HANDLER_MODULE);
					expect(res.to).to.equal(CALLER_MODULE);
					expect(res.payload.text).to.equal(TEXT);
					done();
				})
				.catch(err => {
					console.error(err);
					expect(err).not.to.exist;
				});
		});

		it('Should reject when response says it unsuccessful.', (done) => {
			// Arrange
			const ACTION = 'echo',
				ERROR_MSG = 'errrrorrrr';

			// This is the topic that caller should make
			const topic = `request.${HANDLER_MODULE}.${ACTION}`;
			caller.init();

			handlerMbConn.subscribe(topic)
				.then(() => {
					return handlerMbConn.listen((msg: IMessage) => {
						const request: IRpcRequest = msg.data,
							props = msg.properties,
							response: IRpcResponse = {
								isSuccess: false,
								from: request.to,
								to: request.from,
								payload: {
									type: 'InternalErrorException',
									message: ERROR_MSG
								}
							};
						handlerMbConn.publish(props.replyTo, response, { correlationId: props.correlationId });
					});
				}).then(() => {
					// Act
					return caller.call(HANDLER_MODULE, ACTION);
				})
				.then((res: IRpcResponse) => {
					// Assert
					expect(res).not.to.exist;
				})
				.catch(err => {
					console.error(err);
					expect(err).to.be.instanceOf(InternalErrorException);
					expect(err.message).to.equal(ERROR_MSG);
					done();
				});
		});

		it('Should reject if an error occurs', done => {
			// Arrange
			const ACTION = 'echo';

			// This is the topic that caller should make
			const topic = `request.${HANDLER_MODULE}.${ACTION}`;
			caller.init();

			handlerMbConn.subscribe(topic)
				.then(() => {
					return handlerMbConn.listen((msg: IMessage) => {
						expect(true, 'Should NOT get any request!').to.be.false;
					});
				}).then(() => {
					return callerMbConn.disconnect();
				})
				.then(() => {
					// Act
					return caller.call(HANDLER_MODULE, ACTION);
				})
				.then((res: IRpcResponse) => {
					expect(res, 'Should NOT get any response!').not.to.exist;
				})
				.catch(err => {
					// Assert
					expect(err).to.exist;
					expect(err).to.be.instanceOf(MinorException);
					done();
				});
		});

		it('Should reject if request times out', function (done) {
			// Arrange
			const ACTION = 'echo',
				TEXT = 'eeeechooooo',
				CALLER_TIMEOUT = 3000, // Time to wait before cancel the request
				HANDLER_DELAY = 3500, // Enough to make caller's request time out
				CALLER_QUEUE_TTL = 1000 // Time to live of messages in caller's queue.
				;

			// Unit test timeout
			this.timeout(CALLER_TIMEOUT + HANDLER_DELAY + 3000);

			// This is the topic that caller should make
			const topic = `request.${HANDLER_MODULE}.${ACTION}`;
			callerMbConn.messageExpiredIn = CALLER_QUEUE_TTL;
			caller.timeout = CALLER_TIMEOUT;
			caller.init();

			// Step 1: Caller sends a request, waits in CALLER_TIMEOUT millisecs,
			// 		then stops waiting for response.
			// Step 2: Handler waits in HANDLER_DELAY millisecs to let caller time out, then sends response.
			// Step 3: The response stays in caller's queue for CALLER_QUEUE_TTL millisecs, then
			// 		is deleted by broker.
			let replyTo: string;
			handlerMbConn.subscribe(topic)
				.then(() => {
					return handlerMbConn.listen((msg: IMessage) => {
						expect(msg).to.exist;
						replyTo = msg.properties.replyTo;
						// Step 2
						setTimeout(() => {
							handlerMbConn.publish(
								replyTo,
								{ text: TEXT },
								{
									correlationId: msg.properties.correlationId
								}
							);
						}, HANDLER_DELAY);
						// Do nothing and let request time out!
					});
				})
				.then(() => {
					// Act
					// Step 1
					return caller.call(HANDLER_MODULE, ACTION);
				})
				.then((res: IRpcResponse) => {
					expect(res, 'Should NOT get any response!').not.to.exist;
				})
				.catch(err => {
					// Assert
					expect(err).to.exist;
					expect(err).to.be.instanceOf(MinorException);
					expect(err.message).to.equal('Response waiting timeout');

					// Step 3: Waits for response message to die
					setTimeout(async () => {
						await callerMbConn.subscribe(replyTo);
						await callerMbConn.listen(msg => {
							expect(msg, 'No message should be in caller queue').not.to.exist;
						});

						// Waits 1s to make sure no message is left
						setTimeout(done, 1000);

					}, CALLER_QUEUE_TTL + 500);
				});
		});

	}); // END describe 'call'
});