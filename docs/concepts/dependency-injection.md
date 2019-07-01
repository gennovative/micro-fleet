# Dependency injection

Keep in mind that the base service is like a tree trunk, while [add-ons](./service-add-on.md) are tree branches. 

The code in your [add-ons](./service-add-on.md) may want to use some features from other add-ons, and even from the base service. In order to avoid spaghetti connections amongst them, we leverage dependency injection to decouple them.

In static-typed languages, a dependency registry includes an interface mapped to a class implementing that interface. Later on, the interface is used to retrieved the mapped class.

However, NodeJS a dynamic-typed, TypeScript interface will disappear when the code is transpiled, so our dependency registry includes an identifier (of type string or ES6 Symbol) mapped to a value of arbitrary type. We will use the identifier to resolve the mapped value.

The right place to register dependencies is to override `registerDependencies()` method, which is called before `onStarting` event of the [starting flow](./service-lifecycle.md#starting-flow).

```typescript
// TO DO: Should put in a shared file
const USER_REPO = 'IEventRepository'
const ROLE_REPO = Symbol()

class App extends MicroServiceBase {

    /**
     * @override
     */
    protected registerDependencies(): void {
        super.registerDependencies() // Don't forget this

        // The interface is put here just for type checking,
        // TypeScript compiler will make sure class UserRepository
        // implements interface IUserRepository.
        this._depContainer.bind<IUserRepository>(USER_REPO, UserRepository)
        this._depContainer
            .bind<IRoleRepository>(ROLE_REPO, RoleRepository)
            .asSingleton()

        this._depContainer.bindConstant('VAT', 0.3)
    }

}
```

## Resolve dependencies

Later in your code, you can access the dependency container via `serviceContext`, then manually resolve the dependency like this:

```typescript
import { serviceContext as scx } from '@micro-fleet/common'

class UserLogic {
    public getList(): Promise<User[]> {
        // Beware! NOT recommended way
        const usrRepo = scx.dependencyContainer.resolve<IUserRepository>(USER_REPO)
        return usrRepo.fetchAll()
    }
}
```

However the recommended way is to automatically resolve the constructor parameters.


```typescript
import { inject, injectable, serviceContext as scx } from '@micro-fleet/common'

@injectable()
class UserLogic {
    constructor(
        @inject(USER_REPO) private _userRepo: IUserRepository,
    ) {
    }

    public getList(): Promise<User[]> {
        return this._usrRepo.fetchAll()
    }
}
```

For this to work, class `UserLogic` needs to be decorated with `@injectable()`, and registered to dependency container.

```typescript
this._depContainer.bind>(USER_LOGIC, UserLogic)
```