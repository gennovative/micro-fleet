# Micro Fleet - Concepts

This kind of documentation focuses on ideas and terms, there are many words and little code for illustration. Although Micro Fleet is written in TypeScript, it also allows you to develop with native NodeJS. All examples will be using TypeScript.

If you prefer more code than words, read the [cookbook](../cookbook/README.md).

## Micro Fleet essence

There are only 02 things you need to remember throughout the entire Micro Fleet documentation:

- Service trunk
- Add-on

The _Service trunk_ provides lifecycle and basic functionalities (dependency injection, configuration loader...) for all of your microservices.

Most of the service features are brought about by _Add-ons_. Working with Micro Fleet means you spend the majority of time to work on Add-ons.

## Table of Content

**[Service lifecycle](./service-lifecycle.md)**<br>
**[Service add-on](./service-add-on.md)**<br>
**[Dependency injection](./dependency-injection.md)**<br>
**[Service configuration](./service-configuration.md)**<br>
**[Service communication](./service-communication.md)**<br>
**[Provider vs add-on](./provider-vs-add-on.md)**<br>
**[Models](./models.md)**<br>
**[Database and ORM](./database-orm.md)**<br>
