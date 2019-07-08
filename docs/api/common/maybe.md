# Maybe&lt;T&gt;

Our idea of using `Maybe` to replace `null` and explicit `undefined` is inspired by V8 engine source code. While the implementation is inspired by [ramda-fantasy](https://github.com/ramda/ramda-fantasy/blob/master/src/Maybe.js).

## **Create a Maybe**

`Maybe.Just(value)` to wrap a value in Maybe, an alias is `Maybe.of(value)`

`Maybe.Nothing()` to represent a valueless Maybe

```typescript
import { Maybe } from '@micro-fleet/common'

function fetchUser(): Maybe<User> {
    const user = /* fetch from database */
    return (user == null) ? Maybe.Just(user) : Maybe.Nothing()
}
```

## **Working with the internal value (if any) inside Maybe**

Maybe is a monad (a Functional Programming object) which supports `map`, `chain`, `ap`.

* Use `map(callback)` to transform the internal value then put it back to Maybe. The callback function is only called with `Maybe.Just`, and is ignored with `Maybe.Nothing`. The callback must return a value which will be wrapped in a `Maybe` and returned by `map`.

    ```typescript
    function createDTO(domainModel) {
        // No need to check null
        return UserDTO(domainModel)
    }

    fetchUser()
        .map(user => delete user.password)
        .map(createDTO)
        .map(userDto => {
            response.send(userDto)
        })
    ```

* `chain(callback)` works similar to `map`, the difference is that the callback must return a `Maybe` which will be returned by `chain`.

    ```typescript
    function fetchFamily(user) {
        // No need to check null
        const members = /* fetch from database */
        return (members == null) ? Maybe.Just(members) : Maybe.Nothing()
    }

    fetchUser()
        .map(user => delete user.password)
        .chain(user => {
            return fetchFamily(user)
        })
        .map(members => {
            response.send(members)
        })
    ```

* If you don't like functional style. Method `tryGetValue(defaultVal)` returns internal value (if Just) or `defaultVal` (if Nothing)

    ```typescript
    const maybe = fetchFamily(user)
    const members = maybe.tryGetValue([])
    ```

* Getter `value` returns internal value (if Just) or throws `EmptyMaybeException` (if Nothing)

    ```typescript
    import { EmptyMaybeException } from '@micro-fleet/common'

    try {
        const members = fetchFamily(user).value
        console.log('Found', members.length, 'members')
    }
    catch (ex) {
        if (ex instanceof EmptyMaybeException) {
            console.warn('Family member not found')
        }
        else {
            console.error(ex)
        }
    }
    ```

## **Working with nothing**

* `orElse(callback)` works similar to `map`. However, the callback function is only called with `Maybe.Nothing`, and is ignored with `Maybe.Just`.

    ```typescript
    function fetchUser() {
        return Maybe.Nothing()
    }

    fetchUser()
        .map(user => delete user.password) // Ignored
        .orElse(() => new User()) // Invoked
        .map(createDTO) // Receives the empty User
        .map(userDto => {
            response.send(userDto)
        })
    ```

## **Conditional check**

* Static method `Maybe.isJust(maybe)` returns true if `maybe` is Just.
    ```typescript
    const mb = Maybe.Just(123)
    console.log(Maybe.isJust(mb)) // true
    ```

* Static method `Maybe.isNothing(maybe)` returns true if `maybe` is Nothing.
    ```typescript
    const mb = Maybe.Nothing()
    console.log(Maybe.isNothing(mb)) // true
    ```

> Both static methods above return false if the given parameter is not of type `Maybe`

* Instance method `maybe.isJust()` returns true if `maybe` is Just.
    ```typescript
    const mb = Maybe.Just(123)
    console.log(mb.isJust()) // true
    ```

* Instance method `maybe.isNothing()` returns true if `maybe` is Nothing.
    ```typescript
    const mb = Maybe.Nothing()
    console.log(mb.isNothing()) // true
    ```
