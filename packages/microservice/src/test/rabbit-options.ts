import { IConnectionOptions } from 'back-lib-service-communication';

export default {
	handler: <IConnectionOptions> {
		hostAddress: 'firstidea.lan',
		username: 'firstidea',
		password: 'gennova',
		queue: 'first-handler', // Queue for handler, 
								// in reality, each service must have its own queue
								// (service instances of the same type can share same queue)
		exchange: 'first-infras'
	},
	caller: <IConnectionOptions> {
		hostAddress: 'firstidea.lan',
		username: 'firstidea',
		password: 'gennova',
		queue: '', // Caller must use anonymous queue to receive responses
					// for its own requests, which means each service instances must
					// have a unique queue.
		exchange: 'first-infras'
	}
};