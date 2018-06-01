# Micro Fleet - Backend Service Communication

Belongs to Micro Fleet framework, provides methods for microservices to communicate with each other.

See more examples and usage guide in unit tests.

## INSTALLATION

- Stable version: `npm i @micro-fleet/service-communication`
- Edge (development) version: `npm i git://github.com/gennovative/micro-fleet-service-communication.git`

## DEVELOPMENT

- Install packages in `peerDependencies` section with command `npm i --no-save {package name}@{version}`
- `gulp` to transpile TypeScript then run unit tests (equiv. `gulp compile` + `gulp test`).
- `gulp compile`: To transpile TypeScript into JavaScript.
- `gulp watch`: To transpile without running unit tests, then watch for changes in *.ts files and re-transpile on save.
- `gulp test`: To run unit tests.
  * One of the quickest way to set up the test environment is to use Docker:

    `docker run -d --name rabbitmq -p 15672:15672 -p 5672:5672 rabbitmq:3.6-management-alpine`

  * After tests finish, open file `/coverage/remapped-report/index.html` with a web browser to see the code coverage report which is mapped to TypeScript code.

## RELEASE

- `gulp release`: To transpile and create `app.d.ts` definition file.
- **Note:** Please commit transpiled code in folder `dist` and definition file `app.d.ts` relevant to the TypeScript version.

## VERSIONS

    Note: Will be marked as v1.0.0 when test coverage >= 90%

## 0.2.2
- Moved `global` types to `global.gennova`.

## 0.2.1
- Decorated **MediateRpcHandlerAddOnBase**, **DirectRpcHandlerAddOnBase** with `@unmanaged` annotation.

### 0.2.0
- Moved **MessageBrokerAddOn**, **DirectRpcHandlerAddOnBase** and **MediateRpcHandlerAddOnBase** from `back-lib-foundation`.
- RPC Handlers have module name and service name.
- RPC Callers rebuild exception object received from handlers.
- Test coverage: 85%

### 0.1.0
- *HttpRpcCaller*: Makes direct RPC calls via HTTP to an *ExpressRpcHandler* endpoint.
- *ExpressRpcHandler*: Listens and handles requests from *HttpRpcCaller*.
- *MessageBrokerRpcCaller*: Sends RPC requests to message broker and waits for response.
- *MessageBrokerRpcHandler*: Listens and handles requests from message broker.
- *TopicMessageBrokerConnector*: Underlying class that supports *MessageBrokerRpcCaller* and *MessageBrokerRpcHandler* to connect to RabbitMQ message broker.