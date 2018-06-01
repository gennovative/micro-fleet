# Micro Fleet - Backend ID Generator

Belongs to Micro Fleet framework, provides methods to generate database primary key ID.

See more examples and usage guide in unit test.

## INSTALLATION

- Stable version: `npm i @micro-fleet/id-generator`
- Edge (development) version: `npm i git://github.com/gennovative/micro-fleet-id-generator.git`

## DEVELOPMENT

- Install packages in `peerDependencies` section with command `npm i --no-save {package name}@{version}`
- `gulp` to transpile TypeScript then run unit tests (equiv. `gulp compile` + `gulp test`).
- `gulp compile`: To transpile TypeScript into JavaScript.
- `gulp watch`: To transpile without running unit tests, then watch for changes in *.ts files and re-transpile on save.
- `gulp test`: To run unit tests.

## RELEASE

- `gulp release`: To transpile and create `app.d.ts` definition file.
- **Note:** Please commit transpiled code in folder `dist` and definition file `app.d.ts` relevant to the TypeScript version.

## VERSIONS

### 1.1.0 (Coming soon)
- *IdProvider*: Can fetch from remote source.

### 1.0.0
- *IdProvider*: A service addon that can generates IDs.
- *IdGenerator*: Generates bigint string, shortid, and UUID v4.
