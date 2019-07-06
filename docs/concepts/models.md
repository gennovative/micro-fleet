# **Suggested types of models**

Micro Fleet doesn't enforce any model scheme, you do all the ways you want. But we have a default scheme with 03 layers of models:

## **Entity model**

Full name is Database Entity model. This is the object mapping to database table. Entity syntax depends greatly on ORM library. As said in page ["Database ORM"](./database-orm.md), if you use Micro Fleet prebuilt package `@micro-fleet/persistence`, it uses ObjectionJS as ORM library.

```typescript
import * as moment from 'moment'
import { Model } from 'objection'
import { EntityBase } from '@micro-fleet/persistence'

export class UserEntity extends EntityBase {
    public id: string = undefined
    public username: string = undefined
    public password: string = undefined
    public isActive: boolean = undefined
    public createdAt: string = undefined

    public groupId: string = undefined

    /**
     * @override
    */
    public static get tableName(): string {
        return 'public.users'
    }

    /**
     * [ObjectionJS]
    */
    public static readonly relationMappings: any = (function() {
        const { GroupEntity } = require('./GroupEntity')

        return {
            defaultTemplate: {
                relation: Model.BelongsToOneRelation,
                modelClass: GroupEntity,
                join: {
                    from: `${EventEntity.tableName}.groupId`,
                    to: `${GroupEntity.tableName}.id`,
                },
            },
        }
    })()
}
```

The abstract class `EntityBase` extends ObjectionJS's `Model` class, so class `UserEntity` abides by ObjectionJS rules defined in its [documentations](https://vincit.github.io/objection.js/). However, don't try to assign connection to it with `UserEntity.knex(...)` because the package `@micro-fleet/persistence` has its own way to do this for you.

Entity model should only be used within data access layer (repository) and should not be public to repository interface and above layers. Its properties should be in primitive types (string, number, boolean), even the date time should be in string. The `id` should be string if your ID is a 64-bit integer or above, because NodeJS native number type cannot hold 64-bit integer.

This kind of model is also optional. No need to create entity models if you don't use ORM but prefer building string queries yourself by reading Domain model's properties. 

## **Domain model**

Domain model reflects your business object. This is the kind of model mentioned in OOAD (Object-oriented analysis and design). 

If you follow Anemic Model pattern, your domain model just contains properties that your business object has. Otherwise if you apply Domain Driven Design, domain model can have behaviors (aka methods). The third common pattern is MVC where Model can have methods to read/write data. Though three of them are possible with Micro Fleet, our docs only give examples in Anemic Model since it is the most common and we have special utilities for it.

```typescript
export class User {
    public id: string = undefined
    public username: string = undefined
    public password: string = undefined
    public isActive: boolean = undefined
    public createdAt: string = undefined
    public groupId: string = undefined
}
```

In Anemic Model pattern, Domain model is just a data bag, so all properties are mostly public. Later, in ["Model Translation"](#model-translation) section, we will give it some accessors and behaviors.

## **Data transfer object (DTO)**

DTO usually has a subset of Domain model's properties that are required for an operation as well as some extra properties.

```typescript
import * as moment from 'moment'

export class LoginUserParams {
    public username: string = undefined
    public password: string = undefined
    public isRemembered: boolean = undefined
}

export class LoginUserResult {
    public id: string = undefined
    public createdAt: string = undefined
}
```

This kind of model is the piece of code that can be shared between client-side and server-side source code. Read more in ["Code sharing"](#code-sharing) section. Because this is the object we receive from client-side, the following section is about how to validate it.

### Next ["Model Validation"](./models-validation.md)