
exports.up = function(knex, Promise) {
	return Promise.all([
		users(),
		usersSoftDel(),
		usersBatch(),
		usersTenant(),
	]);

	async function users() {
		const schema = knex.schema;
		await schema.dropTableIfExists('users');
		await schema.createTable('users', tbl => {
			tbl.bigInteger('id').notNullable();
			tbl.string('name').notNullable();
			tbl.integer('age');
			// tbl.timestamp('deleted_at');
			tbl.timestamp('created_at', true);
			tbl.timestamp('updated_at', true);
		});
	}

	async function usersSoftDel() {
		const schema = knex.schema;
		await schema.dropTableIfExists('usersSoftDel');
		await schema.createTable('usersSoftDel', tbl => {
			tbl.bigInteger('id').notNullable();
			tbl.string('name').notNullable();
			tbl.integer('age');
			tbl.timestamp('deleted_at', true);
			tbl.timestamp('created_at', true);
			tbl.timestamp('updated_at', true);
		});
	}

	async function usersBatch() {
		const schema = knex.schema;
		await schema.dropTableIfExists('usersBatch');
		await schema.createTable('usersBatch', tbl => {
			tbl.bigInteger('id').notNullable();
			tbl.string('name').notNullable();
			tbl.integer('age');
			tbl.timestamp('deleted_at', true);
		});
	}

	async function usersTenant() {
		const schema = knex.schema;
		await schema.dropTableIfExists('usersTenant');
		await schema.createTable('usersTenant', tbl => {
			tbl.bigInteger('id').notNullable();
			tbl.bigInteger('tenant_id').notNullable();
			tbl.string('name').notNullable();
			tbl.integer('age');
			tbl.timestamp('deleted_at', true);
		});
	}
};

exports.down = function(knex, Promise) {
	// Don't use down to drop tables, because we want to look at
	// the data after running unit tests.
};
