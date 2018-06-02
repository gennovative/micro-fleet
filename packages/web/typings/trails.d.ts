/// <reference path="./trails-controller.d.ts" />
/// <reference path="./trails-core.d.ts" />
/// <reference path="./trails-model.d.ts" />
/// <reference path="./trails-policy.d.ts" />
/// <reference path="./trails-service.d.ts" />

declare module 'trails/controller' {
	import TrailsController from 'trails-controller';
	export = TrailsController;
}

declare module 'trails/model' {
	import TrailsModel from 'trails-model';
	export = TrailsModel;
}

declare module 'trails/policy' {
	import TrailsPolicy from 'trails-policy';
	export = TrailsPolicy;
}

declare module 'trails/service' {
	import TrailsService from 'trails-service';
	export = TrailsService;
}

declare module 'trails' {
	import { EventEmitter } from 'events';
	import * as winston from 'winston';
	import * as i18next from 'i18next';
	import * as hapi from 'hapi';

	namespace TrailsApp {
		interface IAppApi {
			controllers?: any;
			models?: any;
			policies?: any;
			services?: any;
		}
		
		interface IAppConfig {
			database?: any;
			env?: any;
			i18n?: i18next.Options | any;
			log?: winston.LoggerStatic | any;
			main?: any;
			policies?: any;
			routes?: IRouteConfiguration[];
			session?: any;
			views?: any;
			web?: any;
		}

		type TrailsAppOts = {
			/**
			 * The application package.json
			 */
			pkg: any;

			/**
			 * The application api (api/ folder).
			 */
			// api: IAppApi;

			/**
			 * The application controllers
			 */
			controllers: any;

			/**
			 * The application configuration (config/ folder).
			 */
			config: IAppConfig;
		}

		interface IRouteConfiguration extends hapi.IRouteConfiguration {
			config?: IRouteConfigOptions;
		}
		
		interface IRouteConfigOptions extends hapi.IRouteAdditionalConfigurationOptions {
		}
	}

	class TrailsApp extends EventEmitter {

		services: any;
		controllers: any;

		/**
		 * @param pkg The application package.json
		 * @param app.api The application api (api/ folder)
		 * @param app.config The application configuration (config/ folder)
		 *
		 * Initializes the Trails Application and its EventEmitter parent class. Sets
		 * some necessary default configuration.
		 */
		constructor(app: TrailsApp.TrailsAppOts);
		
		/**
		 * Starts the App. Load all Trailpacks.
		 *
		 * @return {Promise}
		 */
		start(): Promise<TrailsApp>;

		/**
		 * Shuts down, unbinds listeners, unloads trailpacks.
		 * @return {Promise}
		 */
		stop(err?: Error): Promise<TrailsApp>;

		/**
		 * @override
		 * Logs app events for debugging.
		 * @return {boolean}
		 */
		emit(event: string, ...args: any[]): boolean;

		/**
		 * Resolves Promise once ANY of the events in the list have emitted. Also
		 * accepts a callback.
		 * @return {Promise}
		 */
		onceAny(events: string |string[], handler?: Function): Promise<any>;

		/**
		 * Resolves Promise once all events in the list have emitted. Also accepts
		 * a callback.
		 * @return {Promise}
		 */
		after(events: string |string[], handler?: Function): Promise<any>;

		/**
		 * Prevents changes to the app configuration.
		 */
		freezeConfig(): void;

		/**
		 * Allows changes to the app configuration.
		 */
		unfreezeConfig();
		
		/**
		 * Creates any configured paths which may not already exist.
		 */
		createPaths(): Promise<void>;
		
		/**
		 * Exposes the logger on the app object. The logger can be configured by
		 * setting the "config.log.logger" config property.
		 */
		log(): winston.LoggerStatic;

		
		/**
		 * Exposes the i18n translator on the app object. Internationalization can be
		 * configured in config.i18n
		 */
		__(): i18next.I18n;
	}

	export = TrailsApp;
}