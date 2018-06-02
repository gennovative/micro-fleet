"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const back_lib_common_constants_1 = require("back-lib-common-constants");
const back_lib_common_contracts_1 = require("back-lib-common-contracts");
const cm = require("back-lib-common-util");
const back_lib_common_web_1 = require("back-lib-common-web");
const com = require("back-lib-service-communication");
const cfg = require("../addons/ConfigurationProvider");
class MicroServiceBase {
    constructor() {
        this._addons = [];
        this._isStarted = false;
    }
    get isStarted() {
        return this._isStarted;
    }
    /**
     * Bootstraps this service application.
     */
    start() {
        this.registerDependencies();
        this.attachConfigProvider();
        try {
            // A chance for derived class to add more add-ons or do some customizations.
            this.onStarting();
        }
        catch (ex) {
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
    stop(exitProcess = true) {
        setTimeout(() => process.exit(), 2 * this._configProvider.get(back_lib_common_constants_1.SvcSettingKeys.ADDONS_DEADLETTER_TIMEOUT) || 10000);
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                this.onStopping();
                yield this.sendDeadLetters();
                this._depContainer.dispose();
                yield this.disposeAddOns();
                this._isStarted = false;
                this.onStopped();
            }
            catch (ex) {
                this.onError(ex);
            }
            finally {
                exitProcess &&
                    /* istanbul ignore next: only useful on production */
                    this.exitProcess();
            }
        }))();
    }
    /**
     * @return Total number of add-ons that have been added so far.
     */
    attachAddOn(addon) {
        return this._addons.push(addon);
    }
    attachDbAddOn() {
        const { Types } = require('back-lib-persistence');
        let dbAdt = this._depContainer.resolve(Types.DB_ADDON);
        this.attachAddOn(dbAdt);
        return dbAdt;
    }
    attachConfigProvider() {
        let cfgProd = this._configProvider = this._depContainer.resolve(back_lib_common_contracts_1.Types.CONFIG_PROVIDER);
        this.attachAddOn(cfgProd);
        return cfgProd;
    }
    attachIdProvider() {
        const { IdProvider, Types } = require('back-lib-id-generator');
        let idProd = this._depContainer.resolve(Types.ID_PROVIDER);
        this.attachAddOn(idProd);
        return idProd;
    }
    attachMessageBrokerAddOn() {
        let dbAdt = this._depContainer.resolve(com.Types.BROKER_ADDON);
        this.attachAddOn(dbAdt);
        return dbAdt;
    }
    attachTrailsAddOn() {
        let trails = this._depContainer.resolve(back_lib_common_web_1.Types.TRAILS_ADDON);
        trails.onError(this.onError.bind(this));
        this.attachAddOn(trails);
        return trails;
    }
    registerDbAddOn() {
        const { Types, KnexDatabaseConnector, DatabaseAddOn } = require('back-lib-persistence');
        this._depContainer.bind(Types.DB_CONNECTOR, KnexDatabaseConnector).asSingleton();
        this._depContainer.bind(Types.DB_ADDON, DatabaseAddOn).asSingleton();
    }
    registerConfigProvider() {
        this._depContainer.bind(back_lib_common_contracts_1.Types.CONFIG_PROVIDER, cfg.ConfigurationProvider).asSingleton();
    }
    registerIdProvider() {
        const { IdProvider, Types } = require('back-lib-id-generator');
        this._depContainer.bind(Types.ID_PROVIDER, IdProvider).asSingleton();
    }
    registerDirectRpcCaller() {
        this._depContainer.bind(com.Types.DIRECT_RPC_CALLER, com.HttpRpcCaller).asSingleton();
    }
    registerDirectRpcHandler() {
        this._depContainer.bind(com.Types.DIRECT_RPC_HANDLER, com.ExpressRpcHandler).asSingleton();
    }
    registerMessageBrokerAddOn() {
        this._depContainer.bind(com.Types.MSG_BROKER_CONNECTOR, com.TopicMessageBrokerConnector).asSingleton();
        this._depContainer.bind(com.Types.BROKER_ADDON, com.MessageBrokerAddOn).asSingleton();
    }
    registerMediateRpcCaller() {
        if (!this._depContainer.isBound(com.Types.MSG_BROKER_CONNECTOR)) {
            this.registerMessageBrokerAddOn();
        }
        this._depContainer.bind(com.Types.MEDIATE_RPC_CALLER, com.MessageBrokerRpcCaller).asSingleton();
    }
    registerMediateRpcHandler() {
        if (!this._depContainer.isBound(com.Types.MSG_BROKER_CONNECTOR)) {
            this.registerMessageBrokerAddOn();
        }
        this._depContainer.bind(com.Types.MEDIATE_RPC_HANDLER, com.MessageBrokerRpcHandler).asSingleton();
    }
    registerTrailsAddOn() {
        const { TrailsServerAddOn } = require('back-lib-common-web');
        this._depContainer.bind(back_lib_common_web_1.Types.TRAILS_ADDON, TrailsServerAddOn).asSingleton();
    }
    registerDependencies() {
        let depCon = this._depContainer = new cm.DependencyContainer();
        depCon.bindConstant(cm.Types.DEPENDENCY_CONTAINER, depCon);
        this.registerConfigProvider();
        this.registerDirectRpcCaller();
    }
    /**
     * Invoked whenever any error occurs in the application.
     */
    onError(error) {
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
    onStarting() {
        if (this._depContainer.isBound(com.Types.MEDIATE_RPC_CALLER)) {
            let caller = this._depContainer.resolve(com.Types.MEDIATE_RPC_CALLER);
            caller.timeout = this._configProvider.get(back_lib_common_constants_1.RpcSettingKeys.RPC_CALLER_TIMEOUT);
        }
    }
    /**
     * Invoked after all initializations. At this stage, the application is considered
     * started successfully.
     */
    onStarted() {
        console.log('Microservice started successfully with %d addons', this._addons.length);
    }
    /**
     * Invoked when `stop` method is called, before any other actions take place.
     */
    onStopping() {
    }
    /**
     * Invoked after all finalizations have finished. At this stage, the application is
     * considered stopped successfully. The process will be killed after this.
     */
    onStopped() {
    }
    initAddOns() {
        return __awaiter(this, void 0, void 0, function* () {
            let cfgPrvd = this._configProvider, initPromises;
            // Configuration provider must be initialized first, because all other add-ons
            // depend on it.
            yield cfgPrvd.init();
            // If remote config is disabled or
            // if remote config is enanbed and fetching successfully.
            if (!cfgPrvd.enableRemote || (yield cfgPrvd.fetch())) {
                initPromises = this._addons.map(adt => adt.init());
            }
            else {
                throw new cm.CriticalException('Fail to fetch configuration!');
            }
            yield Promise.all(initPromises);
        });
    }
    disposeAddOns() {
        let disposePromises = this._addons.map(adt => {
            // let adtName = adt.constructor.toString().substring(0, 20);
            // console.log('DISPOSING: ' + adtName);
            return adt.dispose();
        });
        return Promise.all(disposePromises);
    }
    exitProcess() {
        console.log('Application has been shutdown, the process exits now!');
        process.exit(); // TODO: Should emit an exit code to also stop Docker instance
    }
    /**
     * Gracefully shutdown the application when user presses Ctrl-C in Console/Terminal,
     * or when the OS is trying to stop the service process.
     *
     */
    handleGracefulShutdown() {
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
    sendDeadLetters() {
        return new Promise(resolve => {
            let timer = setTimeout(resolve, this._configProvider.get(back_lib_common_constants_1.SvcSettingKeys.ADDONS_DEADLETTER_TIMEOUT) || 5000);
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
exports.MicroServiceBase = MicroServiceBase;
