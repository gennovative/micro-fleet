# **Service add-on**

The class `MicroServiceBase` only offers service lifecycle, your service can start up but can do nothing, neither accepting HTTP requests nor handling message broker messages. "Add-ons" are what bring about the actual functionalities for your service.

Imagine the base service is the trunk of a tree, while add-ons are branches. Features are fruits on branches.

For example, if you want to set up a RESTful service with Express server, you must create an add-on, attach it to service trunk. The add-on is initialized during [starting flow](./service-lifecycle.md#starting-flow). When being initialized, the add-on lifts up an Express server listening to a port and handling incoming requests.

