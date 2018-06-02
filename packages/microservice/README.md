# Gennova backend foundation library

Every microservice in Gennova infrastructure, including web, REST, and data service, must inherit class **MicroServiceBase** in this package.

See more examples and usage guide in unit test.

---
##INSTALLATION

- If database utility is used

`npm install git+ssh://git@bitbucket.org:gennovahall/back-lib-persistence.git#1.0.0`

## VERSIONS

### 1.1.0
- Moved `IServiceAddOn` to `common-contracts` package.
- Moved **TrailsServerAddOn**, **RestControllerBase** to `common-web` package.

### 1.0.0
- Changed `IAdapter` to `IServiceAddOn`.
- **TrailsServerAddOn**: Service addon for igniting Trails server.
- **InternalControllerBase**, **RestControllerBase**: Base controller classes that handles CRUD.
- Let `ConfigurationProvider` make requests with `IDirectRpcCaller` instead of raw `request` package.
- Extracted service addons to relevant packages.

### 0.3.0
- Split **RepositoryBase**, **EntityBase** to package [Back Lib Persistence](https://bitbucket.org/gennovahall/back-lib-persistence).

- Split **Guard**, **DependencyContainer**, **Exceptions** to package [Back Lib Common Util](https://bitbucket.org/gennovahall/back-lib-common-util).

- Removed **ExpressHub**

### 0.2.0
- **ConfigurationAdapter**: loads settings from remote Configuration Service, environment variables and appconfig.json file, respectedly. (100% covered)
- **Guard**: `assertDefined` makes sure provided argument is not null or undefined. (100% covered)
- **DependencyContainer**: manage dependencies between classes. (100% covered)
- **KnexDatabaseAdapter**: connect to database with Knex query builder library. (100% covered)
- **EntityBase**: abstract base class for models which are mapped to database tables. (100% covered)
- **RepositoryBase**: abstract base class for repository-pattern classes which use `EntityBase` models. (100% covered)
- **MicroServiceBase**: base class for all services' root class, the application is started from this class.
- **MessageBrokerAdapter**: just added, not working yet. (0% covered)

### 0.1.1
- Included pre-built `dist` folder.

### 0.1.0
- **ConfigurationAdapter**: loads settings from appconfig.json
- **ExpressHub**: Allows micro webs to plug in their routes and answer to requests.