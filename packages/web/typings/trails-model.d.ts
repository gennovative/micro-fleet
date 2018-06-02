declare module 'trails-model' {
	import TrailsApp from 'trails';
	export = class TrailsModel {

		constructor (app: TrailsApp);

		/**
		 * Model configuration
		 */
		static config ();

		/**
		 * Model schema. The definition of its fields, their types, indexes,
		 * foreign keys, etc go here.
		 */
		static schema ();

		/**
		 * Return the name of this model
		 */
		getModelName ();

		/**
		 * Return the name of the database table or collection
		 */
		getTableName ();

		log: any;

		__: any;
	}
}