# **Models translation**

Recommend you read about ["Model validation"](./models-validation.md) before this page.

Converting a model type to another one is a very common but boring task. Understood the boredom, package `@micro-fleet/common` has the class `ModelAutoMapper` for this.

## **Basic translation**

Let's reuse the code for DTO from Model Validation example.

```typescript
import * as joi from 'joi'
import { 
    IModelValidator, JoiModelValidator, extJoi,
    IModelAutoMapper, ModelAutoMapper,
} from '@micro-fleet/common'

const modelSchema = {/* Trimmed for brevity */}

export class CreateUserParams {
    public static validator: IModelValidator<CreateUserParams>
    public static translator: IModelAutoMapper<CreateUserParams>

    public readonly username: string = undefined
    public readonly password: string = undefined
    public readonly isActive: boolean = undefined
    public readonly birthdate: string = undefined
    public readonly groupId: string = undefined
}

CreateUserParams.validator = JoiModelValidator.create({
    schemaMapModel: modelSchema,
})

CreateUserParams.translator = new ModelAutoMapper(
    CreateUserParams,
    CreateUserParams.validator,
)
```

`ModelAutoMapper` constructor has two parameters: required target class, and optional validator of type `IModelValidator`. For example Domain Model doesn't need validator.

```typescript
import { IModelAutoMapper, ModelAutoMapper } from '@micro-fleet/common'

export class User {
    public static translator: IModelAutoMapper<User>

    public id: string = undefined
    public username: string = undefined
    public password: string = undefined
    public isActive: boolean = undefined
    public createdAt: string = undefined
    public groupId: string = undefined
}

User.translator = new ModelAutoMapper(User)
```

Use `translator.whole()` to translate a whole model:

```typescript
const source = {
    username: 'gennovative',
    password: 's3creT!',
}

// Success
const newUser = CreateUserParams.translator.whole(source)
console.log(newUser instanceof CreateUserParams) // true
console.dir(newUser)
/*
{
    username: 'gennovative',
    password: 's3creT!',
    isActive: true,         // default value
    birthdate: undefined,   // no value
    groupId: undefined,     // no value
}
*/
```

Handle validation error:

```typescript
// Fail
const sourceInvalid = {
    username: 'gennovative',
    // Password is required, but not present
}

// Method 1: try-catch validation error
try {
    CreateUserParams.translator.whole(sourceInvalid)
}
catch (err) {
    console.log(err instanceof ValidationError) // true
}

// Method 2: callback receives validation error
const newUser = CreateUserParams.translator.whole(
        sourceInvalid,
        {
            errorCallback: (err) => {
                console.log(err instanceof ValidationError) // true
            }
        }
    )
console.dir(newUser) // null

```

Turn off validation on-demand

```typescript
const sourceInvalid = {
    username: 'gennovative',
    // Password is required, but not present
}

try {
    const newUser = CreateUserParams.translator.whole(
            sourceInvalid,
            {
                enableValidation: false,
            }
        )
    console.log(newUser instanceof CreateUserParams) // true
    console.dir(newUser)
    /*
    {
        username: 'gennovative',
        password: undefined,
        isActive: undefined,
        birthdate: undefined,
        groupId: undefined,
    }
    */
}
catch (err) {
    // Never throws validation error
}

// Method 2: callback receives validation error
const newUser = CreateUserParams.translator.whole(sourceInvalid, (err) => {
        console.log(err instanceof ValidationError) // true
    })
console.dir(newUser) // null

```


## **Advanced translation**


## **Code sharing**