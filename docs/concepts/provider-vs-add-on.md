# Provider vs add-on

Throughout Micro Fleet documentation, you often come across the term "add-on" and "provider", but sometimes you see "it is an add-on as well as a provider". What is the difference?

## Add-on

Add-on is something you must attach to service trunk to be initialized and disposed following the [service lifecycle](./service-lifecycle.md). Add-on has its own lifecycle too, but still abides by the service lifecycle. There is a dedicated page about [Service Add-on](./service-add-on.md).

Add-ons should not be called by any code other than the service trunk.

## Provider

Provider is a type of class providing specific functionalities, for example `CacheProvider` provides methods to read/write data from/to local memory or Redis cache service.

Provider is designed to be called by other code, and can be used **outside of Micro Fleet ecosystem** as a normal utility class. For example you can use `CacheProvider` and `IdProvider` in your non-Micro Fleet code.

## Provider as well as Add-on

Some providers require some setup before being used, so we put that piece of setup logic in an add-on to let it be triggered automatically on service startup.

Some providers are so simple that we make it both a provider and add-on by implementing both provider interface and `IServiceAddOn` interface. For example:

```typescript
class ConfigurationProviderAddOn
    implements IConfigurationProvider, IServiceAddOn {...}
```

## Injected as dependency

It's a best practice to reference by interface, not by concrete class.

```typescript
export class MyAddOn implements IServiceAddOn {
    constructor(
        @inject(CmT.CONFIG_PROVIDER)
        private _configProvider: IConfigurationProvider,
                        // NOT :ConfigurationProviderAddOn
    ) {
    }
}
```

By this way, the caller doesn't care if a class is both provider and add-on. It just cares about functionalities.