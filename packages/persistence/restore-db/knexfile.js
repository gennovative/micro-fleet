const dbConfig = require('../dist/test/database-details').default;

module.exports = {
	development: {
		client: dbConfig.clientName,
		connection: {
			host: dbConfig.host.address,
			database: dbConfig.host.database,
			user: dbConfig.host.user,
			password: dbConfig.host.password
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	}
};
