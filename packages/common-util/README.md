# Micro Fleet - Backend Common Utilities

One of the packages of Micro Fleet framework, contains shared utility classes used by all other packages.

## INSTALLATION

- Stable version: `npm i @micro-fleet/common-util`
- Edge (development) version: `npm i git://github.com/gennovative/micro-fleet-common-util.git`

## DEVELOPMENT

- `gulp` to transpile TypeScript then run unit tests (equiv. `gulp compile` + `gulp test`).
- `gulp compile`: To transpile TypeScript into JavaScript.
- `gulp test`: To run unit tests.
- `gulp watch`: To transpile and watch for edit without running unit tests.

## RELEASE

- `gulp release`: To transpile and create `app.d.ts` definition file.
- **Note:** Please commit transpiled code in folder `dist` and definition file `app.d.ts` relevant to the TypeScript version.

## VERSIONS

### 1.2.1
- Use Bluebird to override global native Promise.

### 1.1.1
- Exports @unmanaged annotation to fix _"Error: The number of constructor arguments in the derived class ProgramRepository must be >= than the number of constructor arguments of its base class."_

### 1.1.0
- Added `InternalErrorException`.
- Added `HandlerContainer` to keep and resolve action handlers.
- Added file `.npmignore`.
- **Testing coverage**: 100%

### 1.0.0
- Added Types constants.
- Added AutoMapper definition.
- Added one parameter to Exception constructor.
- Added `isBound` and `unbind` functions to `DependencyContainer`.
- Added more functions to Guard. (breaking change)
- Renamed IAdapter to IServiceAddOn. (breaking change)
- **Testing coverage**: 100%

### 0.1.0
- DependencyContainer
- Guard
- Exception
- **Testing coverage**: 66%