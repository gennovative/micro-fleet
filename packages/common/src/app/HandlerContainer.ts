import { IDependencyContainer } from './DependencyContainer';
import { Guard } from './Guard';


export type ActionFactory = (obj: any, action: string) => Function;

export type HandlerDetails = {
	dependencyIdentifier: string | symbol;
	actionFactory?: ActionFactory;
};

export class HandlerContainer {
	private static _instance: HandlerContainer;

	public static get instance(): HandlerContainer {
		if (!this._instance) {
			this._instance = new HandlerContainer();
		}
		return this._instance;
	}


	private _handlers: HandlerDetails[];
	private _depContainer: IDependencyContainer;
	

	private constructor() {
		this._handlers = [];
	}


	public set dependencyContainer(container: IDependencyContainer) {
		Guard.assertArgDefined('container', container);
		this._depContainer = container;
	}
	
	public get dependencyContainer(): IDependencyContainer {
		return this._depContainer;
	}

	/**
	 * Removes all registered handlers
	 */
	public clear(): void {
		this._handlers = [];
	}

	/**
	 * Binds an action or some actions to a `dependencyIdentifier`, which is resolved to an object instance.
	 * Returns a/some proxy function(s) which when called, will delegates to the actual resolved function.
	 * 
	 * @param {string} actions Function name of the resolved object.
	 * @param {string | symbol} dependencyIdentifier Key to look up and resolve from dependency container.
	 * @param {ActionFactory} actionFactory A function that use `actions` name to produce the actual function to be executed.
	 */
	public register(actions: string | string[], dependencyIdentifier: string | symbol, actionFactory?: ActionFactory): Function & Function[] {
		Guard.assertArgDefined('action', actions);
		Guard.assertArgDefined('dependencyIdentifier', dependencyIdentifier);

		let fn = function(this: HandlerContainer, act: string): Function {
			this._handlers[act] = { dependencyIdentifier, actionFactory };
			let proxy = (function(action: string, context: HandlerContainer) {
					return function() {
						return context.resolve(action).apply(null, arguments);
					};
				})(act, this);
			return proxy;
		}.bind(this);

		if (Array.isArray(actions)) {
			return <any>actions.map(fn);
		} else {
			return fn(actions);
		}
	}

	/**
	 * Looks up and returns a function that was registered to bind with `action`.
	 * @param action Key to look up.
	 */
	public resolve(action: string): Function {
		Guard.assertIsDefined(this._depContainer, `Dependency container is not set!`);
		let detail: HandlerDetails = this._handlers[action];
		Guard.assertIsDefined(detail, `Action "${action}" was not registered!`);
		return this.resolveActionFunc(action, detail.dependencyIdentifier, detail.actionFactory);
	}


	private resolveActionFunc(action: string, depId: string | symbol, actFactory: ActionFactory): Function {
		// Attempt to resolve object instance
		let instance = this.dependencyContainer.resolve<any>(depId);
		Guard.assertIsDefined(instance, `Cannot resolve dependency "${depId.toString()}"!`);

		let actionFn = instance[action];
		
		// If default action is not available, attempt to get action from factory.
		if (!actionFn) {
			actionFn = (actFactory ? actFactory(instance, action) : null);
		}

		Guard.assertIsDefined(actionFn, `Action "${action}" does not exist in object "${depId.toString()}"!`);

		return actionFn.bind(instance);
	}
}