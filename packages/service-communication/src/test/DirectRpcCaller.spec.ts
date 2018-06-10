import http from 'http';

import 'reflect-metadata';
import { expect } from 'chai';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { MinorException } from '@micro-fleet/common';

import { HttpRpcCaller, IDirectRpcCaller, IRpcRequest, IRpcResponse } from '../app';


const HANDLER_ADDR = 'localhost:3000',
	HANDLER_NAME = 'handler',
	CALLER_NAME = 'caller',
	TEXT_REQUEST = 'Test request',
	TEXT_RESPONSE = 'Test response',
	ACTION = 'getMessage';

describe('HttpRpcCaller', () => {
	let caller: IDirectRpcCaller;

	beforeEach(() => {
		caller = new HttpRpcCaller();
	});

	describe('init', () => {
		it('Should do nothing', () => {
			// Arrange
			caller.baseAddress = HANDLER_ADDR;

			// Act
			caller.init();

			// Assert
			expect(caller.baseAddress).to.equal(HANDLER_ADDR);
		});
	}); // END describe 'init'

	describe('call', () => {

		let server: http.Server;

		afterEach(done => {
			if (server) {
				server.close(() => done());
				server = null;
			} else {
				done();
			}
		});

		it('Should make request and wait for response', done => {
			// Arrange
			const app = express(),
				router = express.Router();

			caller.name = CALLER_NAME;
			caller.baseAddress = HANDLER_ADDR;
			
			// Prepare mock handler
			app.use(bodyParser.json()); // Parse JSON in POST request
			app.use(`/${HANDLER_NAME}`, router);

			router.get('/', (req, res) => res.send('Hello! Postman'));

			router.post(`/${ACTION}`, (req: express.Request, res: express.Response) => {
				const request: IRpcRequest = req.body;
				// Assert
				expect(request).to.exist;
				expect(request.payload.msg).to.equal(TEXT_REQUEST);

				res.status(200).send({
					isSuccess: true,
					from: HANDLER_NAME,
					to: CALLER_NAME,
					payload: {
						text: TEXT_RESPONSE
					}
				});
			});

			server = app.listen(3000, () => {
				caller.call(HANDLER_NAME, ACTION, {
					msg: TEXT_REQUEST
				})
				.then((res: IRpcResponse) => {
					// Assert
					expect(res).to.exist;
					expect(res.payload.text).to.equal(TEXT_RESPONSE);
					done();
				})
				.catch(err => {
					expect(err).to.not.exist;
				});
			});
		});

		it('Should reject if problem occur', done => {
			// Arrange
			caller.name = CALLER_NAME;
			caller.baseAddress = HANDLER_ADDR;

			caller.call(HANDLER_NAME, ACTION, {
				msg: TEXT_REQUEST
			})
			.then((res: IRpcResponse) => {
				// Assert
				expect(res).to.not.exist;
			})
			.catch((err: Error) => {
				expect(err).to.exist;
				expect(err).to.be.instanceOf(MinorException);
				expect(err.message).to.include('ECONNREFUSED');
				done();
			});
		});

	}); // END describe 'call'

	describe('dispose', () => {
		it('Should clear private fields', async () => {
			// Act
			await caller.dispose();

			// Assert
			expect(caller['_requestMaker']).not.to.exist;
			expect(caller['_eventEmitter']).not.to.exist;
		});
	}); // END describe 'init'
});
