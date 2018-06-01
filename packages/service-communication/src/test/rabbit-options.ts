import { IConnectionOptions } from '../app';

export default {
	handler: <IConnectionOptions> {
		hostAddress: 'localhost',
		username: 'guest',
		password: 'guest',
		queue: 'my-handler', // Queue for handler, 
								// in reality, each service must have its own queue
								// (service instances of the same type can share same queue)
		exchange: 'gennovative'
	},
	caller: <IConnectionOptions> {
		hostAddress: 'localhost',
		username: 'guest',
		password: 'guest',
		queue: '', // Caller must use anonymous queue to receive responses
					// for its own requests, which means each service instances must
					// have a unique queue.
		exchange: 'gennovative',
		messageExpiredIn: 3000
	}
};