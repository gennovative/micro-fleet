# **Service add-on**

The class `MicroServiceBase` only offers service lifecycle, your service can start up but can do nothing, neither accepting HTTP requests nor handling message broker messages. "Add-ons" are what bring about the actual functionalities for your service.

Imagine the base service is the trunk of a tree, while add-ons are branches. Features are fruits on branches.

For example, if you want to set up a RESTful service with Express server, you must create an add-on, attach it to service trunk. The add-on is initialized during [starting flow](./service-lifecycle.md#starting-flow). When being initialized, the add-on lifts up an Express server listening to a port and handling incoming requests.

Conveniently, we already have that kind of add-on crafted for you, let's check them out one by one.

## Cache add-on (package [@micro-fleet/cache](https://github.com/gennovative/micro-fleet-cache))

After the add-on is initialized, you can inject an instance of `CacheProvider` to get/set data from/to Redis server or Redis cluster.

## ConfigurationProvider (package [@micro-fleet/microservice](https://github.com/gennovative/micro-fleet-microservice))

This [provider](./provider-vs-add-on.md) is also an add-on as it implements `IServiceAddOn` interface. It is sooo important that it deserves a page about [Service Configuration](./service-configuration.md).

## IdProviderAddOn (package [@micro-fleet/id-generator](https://github.com/gennovative/micro-fleet-id-generator))

This provider is also an add-on. It has API to generate UUID, short Id (7~10 characters in length), native BigInt (using Twitter Snowflake algorithm)... locally as well as remotely. Remote ID generation is best to avoid duplicate ID between many services.

## AuthProviderAddOn (package [@micro-fleet/oauth](https://github.com/gennovative/micro-fleet-oauth))

This provider is also an add-on. When initialized, it helps you to configure ["passportJS"](http://www.passportjs.org/) to use JWT strategy. It also has `@authorized()` decorator to project your REST endpoints.

## DatabaseAddOn (package [@micro-fleet/persistence](https://github.com/gennovative/micro-fleet-persistence))

Reads database details from ConfigurationProvider and create connection to the database. The package also provides repository abstract class that when inheriting it, you immediately have common CRUD operations implemented for you: countAll, create, getOne, getList, patch, update, delete.

## Message broker and RPC add-ons (package [@micro-fleet/service-communication](https://github.com/gennovative/micro-fleet-service-communication))

This package has a bunch of add-ons to help your services communicate directly via HTTP or mediately via message broker. Making remote procedure calls (RPC) is also made easy for you. This topic about [Service Communication](./service-communication) is complicated enough to have a separate page.

## ExpressServerAddOn (package [@micro-fleet/web](https://github.com/gennovative/micro-fleet-web))

The one you are waiting for is here! As you can guess, this add-on lifts up an Express server. Not just this! It also brings about object-oriented style with `@controller()`, `@action()`, `@filter()` decorators.

## How do I make add-on myself

Firstly, you create a class implementing `IServiceAddOn` interface, which enforces you to handle add-on lifecycles.


