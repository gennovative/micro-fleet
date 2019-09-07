# Dead Letters

Add-ons receive dead letters to inform their death is coming and they'd better prepare for it.

Add-on's `deadLetter()` method belongs to [add-on lifecycle](./service-add-on.md/#add-on-lifecycle). It is called after `onStopping` [service event](./service-lifecycle.md#lifecycleeevents), and right before the service trunk starts to dispose all add-ons.

This method must return a promise. All add-ons share an total amount of time (defined by [`DEADLETTER_TIMEOUT`](https://github.com/gennovative/micro-fleet-common/blob/master/src/app/constants/setting-keys/service.ts) setting, default 05 seconds). Because of the single-threaded nature of NodeJS, one add-on taking too long to handle dead letter can hinder other ones.

At this phase, the add-on should stop accepting any more incoming requests, but keep working on the in-progress ones. The add-on should also respond in a nice manner to let the client know.

For example, Web Add-on responds with status code 410 (Gone), while Mediate RPC Handler Add-on simply stops poping message from queue, hopefully the message would be handled by another alive service.

Once the time is out, their `dispose()` is invoked regardless the add-ons has finished preparing for death or not.