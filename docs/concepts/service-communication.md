# **Service Communication**

Service discovery and communication is a headache in microservice world. Micro Fleet simplifies it for you by providing object-oriented RPC abstraction.

## **Accepting incoming requests/messages**

Micro Fleet supports 03 ways to accept incomming requests: HTTP server, Direct RPC handler, Mediate RPC handler.

In all 03 cases, you must declare controller class that has action methods.

### **HTTP Server controller class**

```typescript
import { decorators as d } from '@micro-fleet/web'

@d.controller('users')
export class UserController {

    // GET /users/:id
    @d.GET(':id')
    public getOne() {
        ...
    }

    // OPTION /users
    @d.action('OPTION','')
    public configure() {
        ...
    }
}
```

### **Direct RPC Handler controller class**

```typescript
import { decorators as d } from '@micro-fleet/service-communication'

@d.directController('user-module')
export class UserController {

    @d.action()
    public getOne() {
        ...
    }

    @d.action()
    public getList() {
        ...
    }
}
```

### **Mediate RPC Handler controller class**

```typescript
import { decorators as d } from '@micro-fleet/service-communication'

@d.mediateController('user-module')
export class UserController {

    @d.action()
    public getOne() {
        ...
    }

    @d.action()
    public getList() {
        ...
    }
}
```

As you see, we have tried to make different techniques look similar to one another: a class, controller decorators, action decorators. Now let's inspect some concepts.

## **HTTP server**

This should be used for RESTful gateway service accepting HTTP requests from clients like web browser or mobile app. This kind of service is also called "back-end for front-end (BFF) layer".

Adding this feature to your service by attaching the Web Add-on from package [@micro-fleet/web](https://github.com/gennovative/micro-fleet-web). The helper function `registerWebAddOn()` registers add-on class to dependency container, then returns the add-on instance.

```typescript
import { registerWebAddOn } from '@micro-fleet/web'

class App extends MicroServiceBase {
     /**
     * @override
     */
    protected onStarting(): void {
        super.onStarting()

        const webAddOn = registerWebAddOn()
        this.attachAddOn(webAddOn)
    }
}
```

On initialization, the Web Add-on scans controller directory, registers all controller classes to Dependency Container (DC), then sets up routes for them. When a request coming to a route, the related controller instance will be resolved from DC (triggering [hierarchical dependencies chain](./dependency-injection.md#resolve-hierarchical-dependencies-chain)), then the action method is invoked.


## **Direct communication**

This should be used for communication between internal services, where a service connects directly to another one. When the number of services is plenty, it will cause a connection mesh.

![Direct communication mesh](./images/communication-direct.png "Direct communication mesh")

Advantages:
* Fast
* Suitable for features which requires low latency, for example: Authentication Service which decodes JWT token; Id Generation Service which generate sequential Id numbers.

Disadvantages:
* Each source service must have a mechanism to discover the addresses of all target services that it wants to communicate.
* In case first attempt to send request fails, the source service must have a mechanism to discover the address of an alternative target service and re-send the request to the newly found one. This just repeats if the second target service is down.


Adding this feature to your service by attaching the Web Add-on from package [@micro-fleet/web](https://github.com/gennovative/micro-fleet-web). The helper function `registerWebAddOn()` registers add-on class to dependency container, then returns the add-on instance.

```typescript
import { registerWebAddOn } from '@micro-fleet/web'

class App extends MicroServiceBase {
     /**
     * @override
     */
    protected onStarting(): void {
        super.onStarting()

        const webAddOn = registerWebAddOn()
        this.attachAddOn(webAddOn)
    }
}
```

On initialization, the Web Add-on scans controller directory, registers all controller classes to Dependency Container (DC), then sets up routes for them. When a request coming to a route, the related controller instance will be resolved from DC (triggering [hierarchical dependencies chain](./dependency-injection.md#resolve-hierarchical-dependencies-chain)), then the action method is invoked.

