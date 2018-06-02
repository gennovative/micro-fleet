import TrailsApp = require('trails');

import { injectable, inject, IDependencyContainer, Guard, HandlerContainer,
	INewable, Types as CmT } from 'back-lib-common-util';

import { pushFilterToArray } from './decorators/filter';
import { TenantResolverFilter } from './filters/TenantResolverFilter';
import { ErrorHandlerFilter } from './filters/ErrorHandlerFilter';
import { AuthFilter } from './filters/AuthFilter';
import { serverContext } from './ServerContext';
import { MetaData } from './constants/MetaData';
import { Types as T } from './Types';


const INVERSIFY_INJECTABLE = 'inversify:paramtypes';

@injectable()
export class TrailsServerAddOn implements IServiceAddOn {

	public pathPrefix: string;

	protected _server: TrailsApp;
	protected _onError: Function;
	protected _globalFilters: any[][][];


	constructor(
		@inject(CmT.DEPENDENCY_CONTAINER) depContainer: IDependencyContainer,
		@inject(T.TRAILS_OPTS) protected _trailsOpts: TrailsApp.TrailsAppOts
	) {
		serverContext.setDependencyContainer(depContainer);
		this._onError = (err) => { };
		this._globalFilters = [];
	}


	public get server(): TrailsApp {
		return this._server;
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		Guard.assertIsDefined(this.pathPrefix, '`TrailsServerAddOn.pathPrefix` must be set!');
		serverContext.setPathPrefix(this.pathPrefix);

		this.addErrorHandlerFilter();

		this.buildConfig();
		let server = this._server = new TrailsApp(this._trailsOpts);
		server.on('error', this._onError);
		serverContext.dependencyContainer.bindConstant(T.TRAILS_APP, server);
		return <any>server.start()
			.catch(err => server.stop(err));
	}

	/**
	 * @see IServiceAddOn.deadLetter
	 */
	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * @see IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		return <any>this._server.stop();
	}

	public onError(cb: (err) => void): void {
		this._onError = cb;
	}

	public addErrorHandlerFilter(): void {
		this.addGlobalFilter(ErrorHandlerFilter, f => f.handle, 9);
	}

	public addTenantResolverFilter(): void {
		this.addGlobalFilter(TenantResolverFilter, f => f.resolve, 9);
	}

	/**
	 * Registers a global-scoped filter which is called on every coming request.
	 * @param FilterClass 
	 * @param filterFunc 
	 * @param priority 
	 */
	public addGlobalFilter<T>(FilterClass: INewable<T>, filterFunc: (filter: T) => Function, priority?: number): void {
		pushFilterToArray(this._globalFilters, FilterClass, filterFunc, priority);
	}


	protected buildConfig(): void {
		let config = this._trailsOpts.config,
			routes: any[] = config.routes || [],
			ctrlFilters: Function[];

		this.buildGlobalScopeFilters();

		for (let ctrlName of Object.getOwnPropertyNames(this._trailsOpts.controllers)) {
			let CtrlClass = this._trailsOpts.controllers[ctrlName];
			if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData.CONTROLLER, CtrlClass)) {
				continue;
			}
			
			// Clone array to make sure global filters are executed before controller ones.
			ctrlFilters = <any>this._globalFilters.slice();
			this.buildControllerConfigs(CtrlClass, routes, ctrlFilters);
		}

		config.routes = routes;
	}

	protected buildControllerConfigs(CtrlClass: Function, routes: TrailsRouteConfigItem[], ctrlFilters: Function[]): void {
		let [path] = this.popMetadata(MetaData.CONTROLLER, CtrlClass),
			isGetSetter = (proto, funcName) => {
				let desc = Object.getOwnPropertyDescriptor(proto, funcName);
				return (desc && (desc.get || desc.set));
			};

		this.buildControllerScopeFilters(CtrlClass, ctrlFilters);

		let allFunctions = new Map<string, Function>(),
			actionFunc;
		// Iterates over all function in prototype chain, except root Object.prototype
		for (let proto = CtrlClass.prototype; proto != Object.prototype; proto = Object.getPrototypeOf(proto)) {
			for (let actionName of Object.getOwnPropertyNames(proto)) {
				if (actionName == 'constructor' || isGetSetter(proto, actionName)) { continue; }
				actionFunc = proto[actionName];
				if (typeof actionFunc !== 'function' || 
					allFunctions.has(actionName) || // Make sure function in super class never overides function in derives class.
					!Reflect.hasMetadata(MetaData.ACTION, CtrlClass, actionName)) { // Only register route for function with @action annotation.
						continue; 
				}

				// Let actions in derived class override actions in super class.
				allFunctions.set(actionName, actionFunc);
			}
		}
		// Destructuring to get second element
		for ([, actionFunc] of allFunctions) {
			routes.push(this.buildActionRoute(CtrlClass, actionFunc, path));
			this.buildActionFilters(CtrlClass, ctrlFilters, actionFunc);
		}
	}

	protected buildActionRoute(CtrlClass: any, actionFunc: Function, controllerPath: string): TrailsRouteConfigItem {
		let [method, path] = this.popMetadata(MetaData.ACTION, CtrlClass, actionFunc.name),
			routePath = `${serverContext.pathPrefix}${controllerPath}${path}`,
			thisAddon = this;

		return <TrailsRouteConfigItem> {
			method,
			path: routePath,
			// handler: `${CtrlClass.name}.${actionFunc.name}`
			// handler: HandlerContainer.instance.register(actionFunc.name, controllerIdentifier)
			
			// Creates new controller for each request.
			handler: function (/*req, res, next*/) {
				// Only keep "req" and "res" in arguments list.
				let args = <IArguments><any>Array.prototype.slice.call(<any>arguments, 0, 2),
					ctrl = thisAddon.instantiateClass(CtrlClass, false, thisAddon._server);
				thisAddon.executeFilters(CtrlClass, ctrl, actionFunc, args);
			}
		};
	}

	protected buildGlobalScopeFilters(): void {
		let filters = [];
		// `globalFilters` is a 3-dimensioned matrix:
		// globalFilters = [
		//		1: [ [FilterClass, funcName], [FilterClass, funcName] ]
		//		5: [ [FilterClass, funcName], [FilterClass, funcName] ]
		// ]
		this._globalFilters.reverse().forEach(priorityList => {
			priorityList.forEach(p => {
				let [FilterClass, funcName] = p;
				filters.push(this.bindFuncWithFilterInstance(FilterClass, funcName));
			});
		});
		this._globalFilters = filters;
	}

	protected buildControllerScopeFilters(CtrlClass: Function, ctrlFilters: Function[]): void {
		let metaFilters: any[][] = this.popMetadata(MetaData.CONTROLLER_FILTER, CtrlClass);
		if (!metaFilters || !metaFilters.length) { return; }

		// `reverse()`: Policies with priority of greater number should run before ones with less priority.
		// filters = [
		//		5: [ [FilterClass, funcName], [FilterClass, funcName] ]
		//		1: [ [FilterClass, funcName], [FilterClass, funcName] ]
		// ]
		let FilterClass, funcName;
		metaFilters.reverse().forEach(priorityFilters => {
			for (let f of priorityFilters) { // 1: [ [FilterClass, funcName], [FilterClass, funcName] ]
				if ((typeof f) == 'function') {
					ctrlFilters.push(f);
					continue;
				}
				[FilterClass, funcName] = f;
				ctrlFilters.push(
						this.bindFuncWithFilterInstance(FilterClass, funcName)
					);
			}
		});
	}

	protected bindFuncWithFilterInstance(FilterClass: INewable<any>, funcName: string): Function {
		let filter = this.instantiateClass(FilterClass, true);
		return filter[funcName].bind(filter);
	}

	protected instantiateClass(TargetClass: INewable<any>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any {
		// Create an instance either from dependency container or with normay way.
		// Make sure this instance is singleton.
		if (!Reflect.hasOwnMetadata(INVERSIFY_INJECTABLE, TargetClass)) {
			return this.instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5);
		}
		let instance = this.instantiateClassFromContainer(TargetClass, isSingleton);
		Guard.assertIsDefined(instance, 
			`Class "${TargetClass.name}" is decorated with @injectable, but cannot be resolved. 
			Make sure its class name is bound as dependency identifier, or its constructor arguments are resolved successfully.`);
		return instance;
	}

	protected instantiateClassFromContainer(TargetClass: INewable<any>, isSingleton: boolean): any {
		let container: IDependencyContainer = serverContext.dependencyContainer;
		if (!container.isBound(TargetClass.name)) {
			let bindResult = container.bind(TargetClass.name, TargetClass);
			isSingleton && bindResult.asSingleton();
		}
		return container.resolve(TargetClass.name);
	}

	protected instantiateClassTraditionally(TargetClass: INewable<any>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any {
		if (isSingleton) {
			return TargetClass['__instance'] ? TargetClass['__instance'] : (TargetClass['__instance'] = new TargetClass(arg1, arg2, arg3, arg4, arg5));
		}
		return new TargetClass(arg1, arg2, arg3, arg4, arg5);
	}

	protected buildActionFilters(CtrlClass: Function, ctrlFilters: Function[], actionFunc: Function): void {
		let funcName = actionFunc.name,
			metaFilters: any[][] = this.popMetadata(MetaData.ACTION_FILTER, CtrlClass, funcName);

		let ctrlName = CtrlClass.name,
			// Clone array. Controller filters will be executed before action's own filters.
			actFilters = ctrlFilters.slice();

		if (metaFilters) {
			// `reverse()`: Policies with priority of greater number should run before ones with less priority.
			// metaFilters.reverse().forEach(p => {
			// 	//actPolicies.push(`${p[0]}.${p[1]}`); // Expect: "PolicyClassName.functionName"
			// 	let [FilterClass, funcName] = p;
			// 	actFilters.push(
			// 			this.bindFuncWithFilterInstance(FilterClass, funcName)
			// 		);
			// });

			let FilterClass, funcName;
			metaFilters.reverse().forEach(priorityFilters => {
				for (let f of priorityFilters) { // 1: [ [FilterClass, funcName], [FilterClass, funcName] ]
					if ((typeof f) == 'function') {
						actFilters.push(f);
						continue;
					}
					[FilterClass, funcName] = f;
					actFilters.push(
							this.bindFuncWithFilterInstance(FilterClass, funcName)
						);
				}
			});
		}

		// Save these filters and will execute them whenever
		// a request is routed to this action.
		Reflect.defineMetadata(MetaData.ACTION_FILTER, actFilters, CtrlClass, funcName);
	}

	protected popMetadata(metaKey: string, classOrProto: any, propName?: string): any {
		let metadata = (propName)
			? Reflect.getMetadata(metaKey, classOrProto, propName)
			: Reflect.getOwnMetadata(metaKey, classOrProto);
		Reflect.deleteMetadata(metaKey, classOrProto, propName);
		return metadata;
	}


	private executeFilters(CtrlClass: INewable<T>, ctrlIns: typeof CtrlClass, actionFunc: Function, requestArgs: IArguments): void {
		let filters: Function[] = Reflect.getMetadata(MetaData.ACTION_FILTER, CtrlClass, actionFunc.name),
			nextChain: Function[] = [];

		// At the end of the chain, execute the target action.
		nextChain[filters.length - 1] = function () { actionFunc.apply(ctrlIns, requestArgs); };

		// Inside filter[i] function, when it calls "next()",
		// the filter[i+1] will be executed, and so forth...
		for (let i = filters.length - 2; i >= 0; i--) {
			nextChain[i] = function() {
				filters[i + 1].apply(null, [...requestArgs, nextChain[i + 1]]);
			};
		}

		// Now, invoke the first filter in chain.
		filters[0].apply(null, [...requestArgs, nextChain[0]]);
	}
}