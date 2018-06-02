declare module 'trails-service' {
	import TrailsApp from 'trails';
	export = class TrailsService {
		constructor (app: TrailsApp);

		log: any;

		__: any;
	}
}