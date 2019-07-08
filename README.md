# Micro Fleet

A Docker-friendly microservice-ready framework to develop enterprise-grade NodeJS applications (not for quick prototype).

## How to use

Firstly, grabbing some [concepts](./docs/concepts/README.md) will be helpfull before you jump to code.

Micro Fleet is written in TypeScript, but you can develop with native JavaScript. Our [cookbook] will offer both TypeScript and JavaScript version.

## Contribute

To start developing, these commands need executing:
  * Install global dependencies:
    - `npm i -g`
    - or `yarn global add lerna`
  * Install dependencies:
    - Make sure you have `cd` to the workspace root.
    - `lerna bootstrap`

### How This Project Was Initialized

In case you want to start a new monorepo like this one. This project structure is inspired from [lerna-yarn-workspaces-example](https://github.com/Quramy/lerna-yarn-workspaces-example) but added some customizations:

* Use `independent` mode of [lerna](https://github.com/lerna/lerna)
* The major task runner is NPM, with `scripts` section in `package.json`, as inspired from [how-to-use-npm-as-a-build-tool](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/)

