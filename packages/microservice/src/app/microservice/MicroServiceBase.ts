import { RpcSettingKeys as RpcS, SvcSettingKeys as SvcS } from 'back-lib-common-constants';
import { IConfigurationProvider, Types as ConT } from 'back-lib-common-contracts';
import * as cm from 'back-lib-common-util';
import { TrailsServerAddOn, Types as WT } from 'back-lib-common-web';
import * as per from 'back-lib-persistence';
import * as com from 'back-lib-service-communication';
import { IdProvider } from 'back-lib-id-generator';

import * as cfg from '../addons/ConfigurationProvider';
import { Types } from '../constants/Types';


export abstract class MicroServiceBase {
	protected _configProvider: IConfigurationProvider;
	protected _depContainer: cm.IDependencyContainer;
	protected _addons: IServiceAddOn[];
	protected _isStarted: boolean;
	
	constructor() {
		this._addons = [];
		this._isStarted = false;
	}

	public get isStarted(): boolean {
		return this._isStarted;
	}

	/**
	 * Bootstraps this service application.
	 */
	public start(): void {
		this.registerDependencies();
		this.attachConfigProvider();

		try {
			// A chance for derived class to add more add-ons or do some customizations.
			this.onStarting();
		} catch (ex) {
			this.onError(ex);
			console.error('An error occured on starting, the application has to stop now.');
			// this.stop();
			this.exitProcess();
			return;
		}

		this.initAddOns()
			.then(() => {
				this._isStarted = true;
				this.handleGracefulShutdown();
				this.onStarted();
			})
			.catch(err => {
				this.onError(err);
				console.error('An error occured on initializing add-ons, the application has to stop now.');
				this.stop();
			});
	}

	/**
	 * Gracefully stops this application and exit 
	 */
	public stop(exitProcess: boolean = true): void {
		setTimeout(
			() => process.exit(),
			2 * this._configProvider.get(SvcS.ADDONS_DEADLETTER_TIMEOUT) || 10000
		);

		(async () => {
			try {
				this.onStopping();
				await this.sendDeadLetters();
				this._depContainer.dispose();
				await this.disposeAddOns();
				this._isStarted = false;
				this.onStopped();
			} catch (ex) {
				this.onError(ex);
			} finally {
				exitProcess &&
					/* istanbul ignore next: only useful on production */ 
					this.exitProcess();
			}
		})();
	}


	/**
	 * @return Total number of add-ons that have been added so far.
	 */
	protected attachAddOn(addon: IServiceAddOn): number {
		return this._addons.push(addon);
	}

	protected attachDbAddOn(): per.DatabaseAddOn {
		const { Types } = require('back-lib-persistence');
		let dbAdt = this._depContainer.resolve<per.DatabaseAddOn>(Types.DB_ADDON);
		this.attachAddOn(dbAdt);
		return dbAdt;
	}

	protected attachConfigProvider(): IConfigurationProvider {
		let cfgProd = this._configProvider = this._depContainer.resolve<IConfigurationProvider>(ConT.CONFIG_PROVIDER);
		this.attachAddOn(cfgProd);
		return cfgProd;
	}

	protected attachIdProvider(): IdProvider {
		const { IdProvider, Types } = require('back-lib-id-generator');
		let idProd = this._depContainer.resolve<IdProvider>(Types.ID_PROVIDER);
		this.attachAddOn(idProd);
		return idProd;
	}

	protected attachMessageBrokerAddOn(): com.MessageBrokerAddOn {
		let dbAdt = this._depContainer.resolve<com.MessageBrokerAddOn>(com.Types.BROKER_ADDON);
		this.attachAddOn(dbAdt);
		return dbAdt;
	}

	protected attachTrailsAddOn(): TrailsServerAddOn {
		let trails = this._depContainer.resolve<TrailsServerAddOn>(WT.TRAILS_ADDON);
		trails.onError(this.onError.bind(this));
		this.attachAddOn(trails);
		return trails;
	}
	
	protected registerDbAddOn(): void {
		const { Types, KnexDatabaseConnector, DatabaseAddOn } = require('back-lib-persistence');
		this._depContainer.bind<per.IDatabaseConnector>(Types.DB_CONNECTOR, KnexDatabaseConnector).asSingleton();
		this._depContainer.bind<per.DatabaseAddOn>(Types.DB_ADDON, DatabaseAddOn).asSingleton();
	}

	protected registerConfigProvider(): void {
		this._depContainer.bind<IConfigurationProvider>(ConT.CONFIG_PROVIDER, cfg.ConfigurationProvider).asSingleton();
	}

	protected registerIdProvider(): void {
		const { IdProvider, Types } = require('back-lib-id-generator');
		this._depContainer.bind<IdProvider>(Types.ID_PROVIDER, IdProvider).asSingleton();
	}

	protected registerDirectRpcCaller(): void {
		this._depContainer.bind<com.IDirectRpcCaller>(com.Types.DIRECT_RPC_CALLER, com.HttpRpcCaller).asSingleton();
	}

	protected registerDirectRpcHandler(): void {
		this._depContainer.bind<com.IDirectRpcHandler>(com.Types.DIRECT_RPC_HANDLER, com.ExpressRpcHandler).asSingleton();
	}

	protected registerMessageBrokerAddOn(): void {
		this._depContainer.bind<com.IMessageBrokerConnector>(com.Types.MSG_BROKER_CONNECTOR, com.TopicMessageBrokerConnector).asSingleton();
		this._depContainer.bind<com.MessageBrokerAddOn>(com.Types.BROKER_ADDON, com.MessageBrokerAddOn).asSingleton();
	}

	protected registerMediateRpcCaller(): void {
		if (!this._depContainer.isBound(com.Types.MSG_BROKER_CONNECTOR)) {
			this.registerMessageBrokerAddOn();
		}
		this._depContainer.bind<com.IMediateRpcCaller>(com.Types.MEDIATE_RPC_CALLER, com.MessageBrokerRpcCaller).asSingleton();
	}

	protected registerMediateRpcHandler(): void {
		if (!this._depContainer.isBound(com.Types.MSG_BROKER_CONNECTOR)) {
			this.registerMessageBrokerAddOn();
		}
		this._depContainer.bind<com.IMediateRpcHandler>(com.Types.MEDIATE_RPC_HANDLER, com.MessageBrokerRpcHandler).asSingleton();
	}

	protected registerTrailsAddOn(): void {
		const { TrailsServerAddOn } = require('back-lib-common-web');
		this._depContainer.bind<TrailsServerAddOn>(WT.TRAILS_ADDON, TrailsServerAddOn).asSingleton();
	}

	protected registerDependencies(): void {
		let depCon: cm.IDependencyContainer = this._depContainer = new cm.DependencyContainer();
		depCon.bindConstant<cm.IDependencyContainer>(cm.Types.DEPENDENCY_CONTAINER, depCon);
		this.registerConfigProvider();
		this.registerDirectRpcCaller();
	}
	
	/**
	 * Invoked whenever any error occurs in the application.
	 */
	protected onError(error: any): void {
		/* istanbul ignore next */
		if (error.stack) {
			return console.error(error.stack);
		}
		/* istanbul ignore next */
		let msg = (error.toString ? error.toString() : error + '');
		console.error(msg); // Should log to file.
	}

	/**
	 * Invoked after registering dependencies, but before all other initializations.
	 */
	protected onStarting(): void {
		if (this._depContainer.isBound(com.Types.MEDIATE_RPC_CALLER)) {
			let caller = this._depContainer.resolve<com.IMediateRpcCaller>(com.Types.MEDIATE_RPC_CALLER);
			caller.timeout = this._configProvider.get(RpcS.RPC_CALLER_TIMEOUT);
		}
	}

	/**
	 * Invoked after all initializations. At this stage, the application is considered
	 * started successfully.
	 */
	protected onStarted(): void {
		console.log('Microservice started successfully with %d addons', this._addons.length);
	}

	/**
	 * Invoked when `stop` method is called, before any other actions take place.
	 */
	protected onStopping(): void {
	}

	/**
	 * Invoked after all finalizations have finished. At this stage, the application is 
	 * considered stopped successfully. The process will be killed after this.
	 */
	protected onStopped(): void {
	}


	private async initAddOns(): Promise<void> {
		let cfgPrvd = this._configProvider,
			initPromises;

		// Configuration provider must be initialized first, because all other add-ons
		// depend on it.
		await cfgPrvd.init();

		// If remote config is disabled or
		// if remote config is enanbed and fetching successfully.
		if (!cfgPrvd.enableRemote || await cfgPrvd.fetch()) {
			initPromises = this._addons.map(adt => adt.init());
		} else {
			throw new cm.CriticalException('Fail to fetch configuration!');
		}

		await Promise.all(initPromises);
	}

	private disposeAddOns(): Promise<void[]> {
		let disposePromises = this._addons.map(adt => {
			// let adtName = adt.constructor.toString().substring(0, 20);
			// console.log('DISPOSING: ' + adtName);
			return adt.dispose(); 
		});
		return Promise.all(disposePromises);
	}
	
	private exitProcess() {
		console.log('Application has been shutdown, the process exits now!');
		process.exit(); // TODO: Should emit an exit code to also stop Docker instance
	}
	
	/**
	 * Gracefully shutdown the application when user presses Ctrl-C in Console/Terminal,
	 * or when the OS is trying to stop the service process.
	 * 
	 */
	private handleGracefulShutdown() {
		let handler = () => {
			console.log('Gracefully shutdown...');
			this.stop();
		};

		// SIGINT is the interrupt signal.
		// The Terminal/Console sends it to the foreground process when the user presses Ctrl-C.
		process.on('SIGINT', handler);

		// SIGTERM is the termination signal.
		// Sent by `kill` command, or Upstart, or Heroku dynos, or Docker to shutdown the process.
		// After a period (~10 sec), if the process is still running, SIGKILL will be sent to force immediate termination.
		process.on('SIGTERM', handler);
		
		// Windows has no such signals, so we need to fake SIGINT:
		/* istanbul ignore else */
		if (process.platform === 'win32') {
			const readLine = require('readline');
			let rl = readLine.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			
			// When pressing Ctrl-C
			// Read more: https://nodejs.org/api/readline.html#readline_event_sigint
			rl.on('SIGINT', () => {
				/* istanbul ignore next */
				process.emit('SIGINT');
			});
		}
	}

	private sendDeadLetters(): Promise<void> {
		return new Promise<void>(resolve => {
			let timer = setTimeout(
					resolve,
					this._configProvider.get(SvcS.ADDONS_DEADLETTER_TIMEOUT) || 5000
				);

			let promises = this._addons.map(adt => adt.deadLetter());

			Promise.all(promises).then(() => {
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				resolve();
			});
		})
		.catch(err => this.onError(err));
	}

}