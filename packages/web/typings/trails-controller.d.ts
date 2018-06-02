declare module 'trails-controller' {
	import TrailsApp from 'trails';
	export = class TrailsController {

		app: TrailsApp;

		constructor (app: TrailsApp);

		/**
		 * Controller configuration
		 */
		static config ();

		id: string;

		log: any;

		__: any;
	}
}
