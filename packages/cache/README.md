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

### 1.1.0
  - Added **CacheAddOn**.

### 1.0.0
* **CacheProvider** can:
  - Only works with single cache server (cluster coming soon).
  - Read/write primitive values (string, number, boolean).
  - Read/write flat objects (no nested properties).
  - Read/write arrays of arbitrary types and structures (including nested objects).