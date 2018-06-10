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