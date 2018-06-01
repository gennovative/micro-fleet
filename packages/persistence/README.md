# Micro Fleet - Backend Persistence

Belongs to Micro Fleet framework, provides base repository class with pre-implemented CRUD operations.

## INSTALLATION

- Stable version: `npm i @micro-fleet/persistence`
- Edge (development) version: `npm i git://github.com/gennovative/micro-fleet-persistence.git`

## DEVELOPMENT

  ### TRANSPILE CODE
  - Install packages in `peerDependencies` section with command `npm i --no-save {package name}@{version}`
  - `gulp`: To transpile TypeScript into JavaScript AND running unit tests(equiv. `gulp compile` + `gulp test`).
  - `gulp compile`: To transpile TypeScript into JavaScript WITHOUT running unit tests.
- `gulp watch`: To transpile without running unit tests, then watch for changes in *.ts files and re-transpile on save.
- `gulp test`: To run unit tests.

  ### CREATE UNIT TEST DATABASE
  - One of the quickest ways to set up the test environment is to use Docker:

    `docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:9.6-alpine`
  - Create a database name `unittest-persistence`. If you want to change the name as well as database credentials, edit file `/src/test/database-details.ts` then execute `gulp compile`.
  - Install knex globally: `npm i -g knex`
  - Jump to database migration folder: `cd restore-db`
  - Execute: `knex' migrate:latest`
  - Note:
    * Existing tables are dropped.
	* If you want to re-run migration script, truncate all rows in `knex_migrations` table in database.


## RELEASE

- `gulp release`: To transpile and create `app.d.ts` definition file.
- **Note:** Please commit transpiled code in folder `dist` and definition file `app.d.ts` relevant to the TypeScript version.


## VERSIONS

### 2.1.0 (Coming soon)
- **RepositoryBase** will supports version controlling.

### 2.0.3
- Converted from internal project to Github one.
- Removed support for multiple connections. From now on, each instance of database connector only manages one connection.

### 2.0.2
- Set `utcNow` as public.
- Handles `createdAt` and `updatedAt`.

### 2.0.1
- Decorated **RepositoryBase** with @unmanaged annotation.

### 2.0.0

- [Breaking change] **RepositoryBase** now supports batch operations and multi-tenancy.
- **RepositoryBase** unit tests provide generated IDs instead of auto-increment database IDs.
- **DatabaseAddOn**: moved from `back-lib-foundation`.
- Moved **IConnectionDetail** to `back-lib-common-contracts`.
- **AtomicSessionFlow** rejects with error when no named connection is found.

### 1.0.0

- Converted **DatabaseAdapter** into **KnexDatabaseConnector** which supports executing same query on multiple database connections at the same time.
- **RepositoryBase** no longer couples with `objection` and `knex`.
- Makes sure all date values loaded from database are converted as UTC format.
- **AtomicSessionFactory**, **AtomicSessionFlow** (use with **AtomicSession**): supports transactional queries to provide atomic operation. Their unittests are skipped, read the `console.warn(...)` in the unittest before running.
- **Test coverage:** 100%

### 0.1.0
- EntityBase
- RepositoryBase