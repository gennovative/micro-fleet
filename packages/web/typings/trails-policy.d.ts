declare module 'trails-policy' {
	import TrailsApp from 'trails';
	export = class TrailsPolicy {
		constructor(app: TrailsApp);

		/**
		 * Policy configuration
		 */
		static config();

		log: any;

		__: any;
	}
}