# **Service Configuration**

The number of services in a microservice system is huge, each of those in turn has many instances/replicas. Therefore it's necessary to have a mechanism to manage all instances' settings in one place.

## **Configuration vs settings**

In Micro Fleet, "Configuration" means a set of setting entries for a service. Configuration has name, a configuration can be assigned to many services, while a service may apply only one configuration at a time.

"Setting" (plural "settings") is a name-value-pair entry, settings must belong to a configuration.

## **Configuration Provider**

Configuration Provider is also an add-on, which is initialized first of all in [service starting flow](./service-lifecycle.md#starting-flow). In this init phase, it loads configuration from 03 different sources and registers itself to Dependency Container.

After that, following add-ons can inject Configuration Provider and get necessary settings.

## **Configuration sources**

Configuration Provider loads settings from 03 sources in cascading order. The 03 sources are:

### **File**

By default, Configuration Provider first loads settings from JS or JSON file at path `${process.cwd()}/dist/app/configs/appconfig`, where the "appconfig" part can be `appconfig.js` of `appconfig.json`. You can change the path in service event `onStarting`:

```typescript
onStarting(): void {
    super.onStarting()
    this._configProvider.configFilePath = '/new/path/appconfig'
}
```

The recommended file extension is `.js`, eg: `appconfig.js`, which should be transpiled from `appconfig.ts`. By this way we can take advantage of TypeScript type checking and IDE inteliSense. You can find out the expected data type in JSDoc comment of each key in the [source code]((https://github.com/gennovative/micro-fleet-common/tree/development/src/app/constants/setting-keys)).

```typescript
import { constants } from '@micro-fleet/common'

const {
    DbSettingKeys: D, // Database
    DbClient,
    MbSettingKeys: M, // Message broker
    SvcSettingKeys: S, // Service base
} = constants

export = {
    [S.SERVICE_SLUG]: 'auth-gateway',
    [S.CONFIG_SERVICE_ADDRESSES]: ['10.0.8.1', '10.0.8.2', '10.0.8.3'],
    [S.DEADLETTER_TIMEOUT]: 8000,
    [D.DB_ENGINE]: DbClient.POSTGRESQL,
    [D.DB_ADDRESS]: 'db.example.com',
    //  ^=== ES6 computed property name
}
```

If for some reason you prefer JSON format, you should look up the setting name in [source code](https://github.com/gennovative/micro-fleet-common/tree/development/src/app/constants/setting-keys). Note that array values must be escaped correctly to follow JSON format rules.

```json
{
    "svc_slug": "auth-gateway",
    "svc_config_service_addresses": "[\"10.0.8.1\",\"10.0.8.2\",\"10.0.8.3\"]",
    "svc_deadletter_timeout": 8000,
    "db_engine": "pg",
    "db_host": "db.example.com",
}
```

### **Environment variables**

The second order is environment variables, you should look up the setting name in [source code](https://github.com/gennovative/micro-fleet-common/tree/development/src/app/constants/setting-keys) just as with JSON file.

Any existing settings from previous order are overriden.

### **From remote service**

The last order is to fetch settings from remote service. Any existing settings from previous order are overriden.

This method only works when `IConfigurationProvider.enableRemote` is `true` (default is `false`), and requires the setting `CONFIG_SERVICE_ADDRESSES` in [Config File](#file) or Environment Variable.

The Configuration Provider then keeps updating these remote settings by re-fetching interval. The interval can be defined with setting key `CONFIG_REFETCH_INTERVAL` (default 5 minutes).

## **Required settings**

Each types of add-on requires what particular settings to be defined, and in where. For example, Configuration Provider optionally requires `SERVICE_SLUG` and `CONFIG_SERVICE_ADDRESSES` in either file or environment variable, if remote fetching is turn on.

`SERVICE_SLUG` is often required by add-on in their initialization phase, so it's a best practice to define this setting in appconfig file.

## **Custom settings**

Setting name must be a valid name for an environment variable, and friendly with Terminal/Command line.

The safest naming convention is "lower snake case". For examples: `svc_slug`, `db_password`, `myaddon_scale_ratio`...

## **Retrieving configuration**

The Configuration Provider registers itself to Dependency Container very early, even before service event `onStarting`, so you can inject it wherever you want.

```typescript
import {
    inject, constants, Types as T, IConfigurationProvider,
} from '@micro-fleet/common'

const { SvcSettingKeys: S } = constants

export class MyAddOn implements IServiceAddOn {

    constructor(
        @inject(T.CONFIG_PROVIDER) configProvider: IConfigurationProvider,
    ) {
        configProvider.get(S.SERVICE_SLUG)
            .map(slug => console.log('Slug:', slug))
            .orElse(() => console.warn('No slug'))

        const maybe = configProvider.get('myaddon_scale_ratio')
        console.log('Ratio:', maybe.value)
    }

}
```
Method `IConfigurationProvider.get` returns a [Maybe](https://github.com/gennovative/micro-fleet-common/blob/master/docs/howto-maybe.md) in package `@micro-fleet/common`, abidding by our [no-null policy](./no-null-policy.md).

