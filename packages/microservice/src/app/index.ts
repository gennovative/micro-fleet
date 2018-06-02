/* istanbul ignore next */
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
	require('reflect-metadata');
}

export * from './addons/ConfigurationProvider';
export * from './constants/Types';
export * from './controllers/InternalControllerBase';
export * from './microservice/MicroServiceBase';
