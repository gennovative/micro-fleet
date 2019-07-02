# **Service add-on**

The class `MicroServiceBase` only offers service lifecycle, your service can start up but can do nothing, neither accepting HTTP requests nor handling message broker messages. "Add-ons" are what bring about the actual functionalities for your service.

Imagine the base service is the trunk of a tree, while add-ons are branches. Features are fruits on branches.

For example, if you want to set up a RESTful service with Express server, you must create an add-on, attach it to service trunk. The add-on is initialized during [starting flow](./service-lifecycle.md#starting-flow). When being initialized, the add-on lifts up an Express server listening to a port and handling incoming requests.

Conveniently, we already have that kind of add-on crafted for you, let's check them out one by one.

## **Micro Fleet prebuilt add-ons**

### Cache add-on (package [@micro-fleet/cache](https://github.com/gennovative/micro-fleet-cache))

After the add-on is initialized, you can inject an instance of `CacheProvider` to get/set data from/to Redis server or Redis cluster.

### Configuration add-on (package [@micro-fleet/microservice](https://github.com/gennovative/micro-fleet-microservice))

It is sooo important that it deserves a page about [Service Configuration](./service-configuration.md).

### ID generating add-on (package [@micro-fleet/id-generator](https://github.com/gennovative/micro-fleet-id-generator))

It has API to generate UUID, short Id (7~10 characters in length), native BigInt (using Twitter Snowflake algorithm)... locally as well as remotely. Remote ID generation is best to avoid duplicate ID between many services.

### OAuth add-on (package [@micro-fleet/oauth](https://github.com/gennovative/micro-fleet-oauth))

When initialized, it helps you to configure ["passportJS"](http://www.passportjs.org/) to use JWT strategy. It also has `@authorized()` decorator to project your REST endpoints.

### Database add-on (package [@micro-fleet/persistence](https://github.com/gennovative/micro-fleet-persistence))

Reads database details from ConfigurationProvider and create connection to the database. The package also provides repository abstract class that when inheriting it, you immediately have common CRUD operations implemented for you: countAll, create, getOne, getList, patch, update, delete.

### Message broker and RPC add-ons (package [@micro-fleet/service-communication](https://github.com/gennovative/micro-fleet-service-communication))

This package has a bunch of add-ons to help your services communicate directly via HTTP or mediately via message broker. Making remote procedure calls (RPC) is also made easy for you. This topic about [Service Communication](./service-communication) is complicated enough to have a separate page.

### Web add-on (package [@micro-fleet/web](https://github.com/gennovative/micro-fleet-web))

The one you are waiting for is here! As you can guess, this add-on lifts up an Express server. Not just this! It also brings about object-oriented style with `@controller()`, `@action()`, `@filter()` decorators.

## **How do I create add-on myself**

Firstly, you create a class implementing `IServiceAddOn` interface, which enforces you to handle add-on lifecycles.

Interface `IServiceAddOn` is declared globally and is available when you install package [@micro-fleet/common](https://github.com/gennovative/micro-fleet-common)

```typescript
import {
    injectable, inject, Guard, Types as CmT, IConfigurationProvider,
} from '@micro-fleet/common'

@injectable()
export class MyAddOn implements IServiceAddOn {
    public static readonly TYPE = Symbol()

    public readonly name: string = 'MyAddOn'

    constructor(
        @inject(CmT.CONFIG_PROVIDER)
        private _configProvider: IConfigurationProvider,
    ) {
        Guard.assertArgDefined('_configProvider', _configProvider)
    }

    /**
     * @see IServiceAddOn.init
     */
    public init(): Promise<void> {
        // Do sync or async initialization here
        return Promise.resolve()
    }

    /**
     * @see IServiceAddOn.deadLetter
     */
    public deadLetter(): Promise<void> {
        // Settle things before disposal
        return Promise.resolve()
    }

    /**
     * @see IServiceAddOn.dispose
     */
    public dispose(): Promise<void> {
        return Promise.all([
            // helperOne.dispose(),
            // helperTwo.dispose(),
        ])
    }
}
```

### **Add-on lifecycle**

* `init()`: This method is called on all add-ons at the same time after service event `onStarting` (see [Service starting flow](./service-lifecycle.md#starting-flow)). This method must return a promise, and only when all add-ons' init promises is resolved, will service event `onStarted` fire up.

    If one of the init promises rejects, the service stopping flow is triggered.

    If one of them is never settled (resolve or reject), the service waits forever (_Editor note_: This behavior should be improved with a timeout).

* `deadLetter()`: This method is called on all add-ons at the same time after service event `onStopping` (see [Service stopping flow](./service-lifecycle.md#stopping-flow)). This method must return a promise. The service will wait for an amount of time (default 5 seconds, can be configured with name [`ADDONS_DEADLETTER_TIMEOUT`](https://github.com/gennovative/micro-fleet-common/blob/master/src/app/constants/setting-keys/service.ts)) before proceed to call `dispose()`.

    At this phase, the add-on should stop accepting any more incoming requests, but keep working on the in-progress ones. The add-on should also respond in a nice manner to let the client know.

    For example, Web Add-on responds with status code 410 (Gone), while Mediate RPC Handler Add-on simply stops poping message from queue, hopefully the message would be handled by another alive service.

* `dispose()`: This method is called right after all deadletter promises are resolved, or ADDONS_DEADLETTER_TIMEOUT timer is due. This method must return a promise. The service will wait for an amount of time until the [`MAX_STOP_TIMEOUT`](https://github.com/gennovative/micro-fleet-common/blob/master/src/app/constants/setting-keys/service.ts) timer is due (default 10 seconds, counted from the beginning of stopping flow, which means there might be apx. 5 seconds left at the moment).

    At this phase, the add-on should stop all the work and release all occupied resources. Any request attempt from client will result in Not Found error.

### **Attaching add-on to service trunk**

If your add-on doesn't need constructor dependency injection, and the add-on instance doesn't need to be resolved elsewhere.

```typescript
import { MicroServiceBase } from '@micro-fleet/microservice'

class App extends MicroServiceBase {
    /**
     * @override
     */
    protected onStarting(): void {
        super.onStarting()
        this.attachAddOn(new MyAddOn())
    }
}
```

If your add-on's constructor requires its paremeters injected, or if the add-on instance needs to be injected into other classes, you should [register it to Dependency Container](./dependency-injection.md#register-dependency).

```typescript
import { MicroServiceBase } from '@micro-fleet/microservice'

class App extends MicroServiceBase {
    /**
     * @override
     */
    protected registerDependencies(): void {
        super.registerDependencies()
        this._depContainer
            .bind(MyAddOn.TYPE, MyAddOn)
            .asSingleton() // Popular choice, but depends.
    }

    /**
     * @override
     */
    protected onStarting(): void {
        super.onStarting()

        const myAddon = this._depContainer.resolve(MyAddOn.TYPE)
        this.attachAddOn(myAddon)
    }
}
```