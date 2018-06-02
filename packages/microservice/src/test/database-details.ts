import { DbClient } from 'back-lib-common-constants';

export default {
	clientName: DbClient.POSTGRESQL,
	host: {
		address: 'localhost',
		user: 'postgres',
		password: 'postgres',
		database: 'unittest'
	}
};