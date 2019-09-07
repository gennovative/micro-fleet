# **No null policy**

Although Micro Fleet is written in TypeScript -a typed language- but we have no way to inform the caller about a function may return `null` or `undefined`.

By banning `null` and explicit `undefined` throughout our code base, we reduce the conditional branches to check `null` and `undefined` in our code, and just focus on the positive logic.


```typescript
function fetchFamily(user) {
    // No need to check null
    const members = /* fetch from database */
    return (members == null) ? Maybe.Just(members) : Maybe.Nothing()
}

fetchUser()
    .map(user => delete user.password)
    .chain(fetchFamily)
    .map(members => {
        response.send(members)
    })
```

All Micro Fleet functions that may return valueless result will return a [Maybe](https://github.com/gennovative/micro-fleet-common/blob/master/docs/howto-maybe.md) in package `@micro-fleet/common`.