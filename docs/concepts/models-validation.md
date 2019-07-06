# **Models validation**

Recommend you read about ["Suggested model types"](./models.md) before this page.

## **Defining rules**

Package `@micro-fleet/common` brings about the class `JoiModelValidator` for validating model.

```typescript
import * as joi from 'joi'
import { 
    IModelValidator, JoiModelValidator, extJoi,
} from '@micro-fleet/common'

const modelSchema = {
    username: joi.string().max(100)
        .required(),
    password: joi.string().min(6).max(250)
        .required(),
    isActive: joi.bool()
        .default(true),
    birthdate: extJoi.genn().dateString({ isUTC: true })
        // .options({ convert: true }) // Default `true` 
        .optional(),
    groupId: extJoi.gen().bigint()
        .options({convert: false})
        .optional(),
}

export class CreateUserParams {
    public static validator: IModelValidator<CreateUserParams>

    public readonly username: string = undefined
    public readonly password: string = undefined
    public readonly isActive: boolean = undefined
    public readonly birthdate: string = undefined
    public readonly groupId: string = undefined
}

CreateUserParams.validator = JoiModelValidator.create({
    schemaMapModel: modelSchema,
})
```

It's recommended you follow this pattern because the static property `validator` is automatically called by other Micro Fleet's prebuilt utility.

We use [Joi](https://github.com/hapijs/joi) as validation library. The `extJoi` from package `@micro-fleet/common` is our Joi extension with the namespace `gen()` (short for Gennovative - Our Github organization name) including 2 custom rules `dateString()` and `bigint()`. In this example, we convert `birthdate` to JS native Date instance, but keeping `groupdId` as string (not converting to JS native bigint).

```typescript
import * as joi from 'joi'
import { 
    IModelValidator, JoiModelValidator, extJoi,
} from '@micro-fleet/common'

export class EditUserParams {
    public readonly username: string = undefined
    public readonly password: string = undefined
    public readonly isActive: boolean = undefined
    public readonly birthdate: string = undefined
    public readonly groupId: string = undefined
}

EditUserParams.validator = JoiModelValidator.create({
    schemaMapModel: modelSchema,
    schemaMapPk: id: extJoi.genn().bigint()
            .options({convert: false})
            .required(),
})
```

In DTO for edit, we reuse the model schema, plus validation rule for the PK (primary key). In this case, our PK is a bigint string, we will talk about composite PK in cookbook page.

## **Validating**

Validate the whole object with method `validator.whole()`. All required properties are checked and `ValidationError` will be thrown if failed.

```typescript
import { ValidationError } from '@micro-fleet/common'

const source = {
    username: 'gennovative',
    password: 's3creT!',
}

// Success
const [err, result] = CreateUserParams.validator.whole(source)
console.log(err) // null
console.dir(result)
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

```typescript
// Fail
const sourceInvalid = {
    username: 'gennovative',
}

const [err, result] = CreateUserParams.validator.whole(sourceInvalid)
console.log(err instanceof ValidationError) // true
console.dir(result) // null
```

Validate just some properties in object with method `validator.partial()`. All required properties are regarded as OPTIONAL except the ones in `schemaMapPk`, which means PK rule isn't converted to `.optional()`.

```typescript
import { ValidationError } from '@micro-fleet/common'

const source = {
    id: '1357902468',
    username: 'gennovative',
}

// Success
const partialUser = EditUserParams.validator.partial(source)
console.log(partialUser instanceof EditUserParams) // true
console.dir(partialUser)
/*
{
    username: 'gennovative',
    password: undefined,    // No value
    isActive: true,         // Default value
    birthdate: undefined,   // No value
    groupId: undefined,     // No value
}
*/
```
```typescript
const sourceInvalid = {
    username: 'gennovative',
}
// Fail
const [err, result] = EditUserParams.validator.partial(sourceInvalid)
console.log(err instanceof ValidationError) // true
console.dir(result) // null
```

This technique is useful for patching (partial updating) operation, where the PK is always required, but other properties are optional.

### Next ["Model Translation"](./models-translation.md)