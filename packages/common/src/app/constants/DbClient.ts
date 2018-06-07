/**
 * Db driver names.
 */
export enum DbClient {
	/**
	 * Microsoft SQL Server
	 */
	MSSQL = 'mssql',

	/**
	 * MySQL
	 */
	MYSQL = 'mysql',

	/**
	 * PostgreSQL
	 */
	POSTGRESQL = 'pg',

	/**
	 * SQLite 3
	 */
	SQLITE3 = 'sqlite3',
}