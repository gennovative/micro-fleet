# Micro Fleet - Backend Common Contracts

Belongs to Micro Fleet framework, contains interfaces, models and constants which are shared between micro services.

## INSTALLATION

- Stable version: `npm i @micro-fleet/common-contracts`
- Edge (development) version: `npm i git://github.com/gennovative/micro-fleet-common-contracts.git`

## DEVELOPMENT

- Install packages in `peerDependencies` section.
- `gulp` to transpile TypeScript then run unit tests (equiv. `gulp compile` + `gulp test`).
- `gulp compile`: To transpile TypeScript into JavaScript.
- `gulp watch`: To transpile without running unit tests, then watch for changes in *.ts files and re-transpile on save.
- `gulp test`: To run unit tests.
  * After tests finish, open file `/coverage/remapped-report/index.html` with a web browser to see the code coverage report which is mapped to TypeScript code.

## RELEASE

- `gulp release`: To transpile and create `app.d.ts` definition file.
- **Note:** Please commit transpiled code in folder `dist` and definition file `app.d.ts` relevant to the TypeScript version.

## VERSIONS

### 1.2.2
- Moved repository interfaces to `@micro-fleet/persistence`.

### 1.2.1
- Merged with deprecated `common-constants` package.

### 1.2.0
- Added **CacheSettings** and **ICacheConnectionDetail**.
- Added function `asObject` to **PagedArray**.
- Set **JoiModelValidator** to not require PK as default.
- Updated to latest dependency versions and relevant unittests.

### 1.1.0

* **IRepository**: 
	- Added generic param for id data type, to support composite primary key.
	- Supports write operations (update, path, delete) on multiple items.
	- Differentiates read operations between active and soft-deleted records.
* **TenantPk**: Primary key data type that support multi-tenancy.
* **IHardDelRepository**: Extends from `IRepository`, supports hard deletion.
* **JoiModelValidator**: Added support for composite primary key.
* **SettingItemDataType**: Added 2 types StringArray and NumberArray.
* **DatabaseSettings**: Wraps an array of database settings.
* **DbConnectionSetting**: Wraps an array of database connection settings.
* **Types**: Dependency identifier for `IConfigurationProvider` and `IDependencyContainer` (moved from `back-lib-foundation`).

### 1.0.0

* **PagedArray<T>**: A derived Array class that supports pagination.
* **IRepository**: Provides common methods for repositories.
* Use **BigSInt** (alias of `string`) as data type of model ID.
* **ModelValidatorBase**: Base class that provides methods to validate models.
* **ModelTranslatorBase**: Base class that provides methods to convert arbitrary objects to models.
* **GetSettingRequest**, **GetSettingRequestValidator**, **GetSettingRequestTranslator**: Request model to fetch service settings, comes with its validators and translators.
* **AtomicSession** (use with **AtomicSessionFactory** and **AtomicSessionFlow**): supports transactional queries.
* Test coverage: **100%**