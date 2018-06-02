# Gennova backend common web library

Contains classes used by web and rest services.

See more examples and usage guide in unit test.

## INSTALLATION

`npm i`: To install dependencies.
`gulp` to transpile TypeScript.

## DEVELOPMENT

`gulp watch`: To transpile and watch for edit.

## RELEASE

`gulp release`: To transpile and create `app.d.ts` definition file.

---
## VERSIONS

### 0.2.1
- Improved controller and action filter pre-binding process.
- Improved automatic route generation process.
- Fixed some bugs in `RestCRUDControllerBase`.
- Removed `api` property from TrailsOpts.

### 0.2.0
- Split **RestControllerBase** into **RestCRUDControllerBase** (inherits **RestControllerBase**).
- **RestControllerBase** provides basic response actions.
- **RestCRUDControllerBase** provides CRUD actions and function `CreateRouteConfigs` to generate route configs.

### 0.1.0
- **TrailsServerAddOn**: Service addon for igniting Trails server.
- **RestControllerBase**: Base controller classes that handles REST CRUD endpoints.