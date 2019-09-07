# **Service lifecycle**

Your system may have different kinds of services such as RESTful service that acts as gateway, business service that processes business logic, and helper/utility services for monitoring, logging etc. For the sake of easy management, all Micro Fleet services share same lifecycle mechanism and working principle.

## **Lifecycle events**

[`MicroServiceBase`](https://github.com/gennovative/micro-fleet-microservice/blob/master/src/app/microservice/MicroServiceBase.ts) from package `@micro-fleet/microservice` is an abstract class which should be inherited by all service instances. After its `start()` method is called, it fires up these lifecycle events:

_onStarting_: At this point, all [dependencies](./dependency-injection.md) have been registered. This is the right time to attach [add-on](./service-add-on.md) to you service.

_onStarted_: All add-ons have been started successfully. The service will keep running until its method `stop()` is called.

_onStopping_: The stopping flow begins. Add-ons are still working.

_onStoppped_: All add-ons have been disposed, which means all resources have been released (if the add-ons behave themselves). The service is useless now and the process is ready to exit.

_onError_: An error occured. This event may be invoked by other lifecyle events, or by add-ons.

## **Lifecycle flow chart**

### **Starting flow**

![Chart for starting flow](./images/start-flow.png "The starting flow")

- `start()` method must be called to bootstrap the service.
- Registering dependencies which should be ready to be injected later.
- Attaching Configuration Provider. However, config settings are not loaded.
- Invoking `onStarting()` event.
- If error occurs from any previous steps up to this point, `onError` event is invoked then the process exits.
- Initializing add-ons. The Configuration Provider is initialized first (it is also an add-on), then it loads all settings. After that all add-ons are initialzed **at the same time**. Therefore it is advisable not to let an add-on rely on another one at this point, but [do it lazily](./dependency-injection.md#lazily-resolved).
- From now on, any error occurence will trigger the stopping flow.
- Registering handlers for OS-level signals like SIGTERM.
- Invoking `onStarted()` event.
- The service now keeps running in stable state.
- By default (if not overriden by derived class), when `onError` event receives an instance of `CriticalException`, the stopping flow is triggered. Otherwise, the error is just logged.

### **Stopping flow**

![Chart for stopping flow](./images/stop-flow.png "The stopping flow")

Sorry for the wierd and unstandard-looking chart, here is the explanation:

- The stopping flow is triggered either by calling `stop()` method or because the process receives SIGTERM signal from operating system (eg: user presses Ctrl+C).
- A timer is set with duration defined by STOP_TIMEOUT settings. Read more about defining service settings in [Service Configuration](./service-configuration.md) page.
- During the whole flow from now on, if STOP_TIMEOUT timer is due, the process exits immediately.
- Invoking `onStopping()` event.
- Sending [dead letters](./dead-letters.md) to all add-ons at the same time, and waiting for them to deal with.
- Disposing all add-ons at the same time.
- Invoking `onStopped()` event.
- If `exitNow` parameter is passed as "true" to method `stop()`, the process exits immediately. Otherwise, waiting for STOP_TIMEOUT timer.
- The process exits.