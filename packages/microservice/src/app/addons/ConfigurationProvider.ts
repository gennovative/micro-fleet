import { EventEmitter } from 'events';

import { SvcSettingKeys as S, ModuleNames as M, ActionNames as A } from 'back-lib-common-constants';
import { GetSettingRequest, SettingItem, SettingItemDataType,
	IConfigurationProvider } from 'back-lib-common-contracts';
import { inject, injectable, Guard, CriticalException } from 'back-lib-common-util';
import { IDirectRpcCaller, IRpcResponse, Types as ComT } from 'back-lib-service-communication';


/**
 * Provides settings from appconfig.json, environmental variables and remote settings service.
 */
@injectable()
export class ConfigurationProvider
		implements IConfigurationProvider {
	private _addresses: string[];
	private _configFilePath;
	private _enableRemote: boolean;
	private _eventEmitter: EventEmitter;
	private _fileSettings;
	private _remoteSettings;
	private _refetchTimer: NodeJS.Timer;
	private _refetchInterval: number;
	private _isInit: boolean;

	constructor(
		@inject(ComT.DIRECT_RPC_CALLER) private _rpcCaller: IDirectRpcCaller
	) {
		Guard.assertArgDefined('_rpcCaller', _rpcCaller);

		this._configFilePath = `${process.cwd()}/appconfig.json`;
		this._remoteSettings = this._fileSettings = {};
		this._enableRemote = false;
		this._eventEmitter = new EventEmitter();
		this._rpcCaller.name = 'ConfigurationProvider';
		this._isInit = false;
	}

	/**
	 * @see IConfigurationProvider.enableRemote
	 */
	public get enableRemote(): boolean {
		return this._enableRemote;
	}

	/**
	 * @see IConfigurationProvider.enableRemote
	 */
	public set enableRemote(val: boolean) {
		this._enableRemote = val;
	}


	private get refetchInterval(): number {
		return this._refetchInterval;
	}

	private set refetchInterval(val: number) {
		this._refetchInterval = val;
		if (this._refetchTimer) {
			this.stopRefetch();
			this.repeatFetch();
		}
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		if (this._isInit) {
			return Promise.resolve();
		}
		this._isInit = true;

		try {
			this._fileSettings = require(this._configFilePath);
		} catch (ex) {
			console.warn(ex);
			this._fileSettings = {};
		}

		if (this.enableRemote) {
			let addresses = this.applySettings();
			if (!addresses) {
				return Promise.reject(new CriticalException('No address for Settings Service!'));
			}
			this._addresses = addresses;
		}

		return Promise.resolve();
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
		this.stopRefetch();
		this._configFilePath = null;
		this._fileSettings = null;
		this._remoteSettings = null;
		this._enableRemote = null;
		this._rpcCaller = null;
		this._eventEmitter = null;
		this._isInit = null;
		return Promise.resolve();
	}

	/**
	 * @see IConfigurationProvider.get
	 */
	public get(key: string, dataType?: SettingItemDataType): number & boolean & string {
		let value = this._remoteSettings[key];
		if (value === undefined && dataType) {
			value = this.parseValue(process.env[key] || this._fileSettings[key], dataType);
		} else if (value === undefined) {
			value = process.env[key] || this._fileSettings[key];
		}
		return (value ? value : null);
	}

	/**
	 * @see IConfigurationProvider.fetch
	 */
	public async fetch(): Promise<boolean> { // TODO: Should be privately called.
		let addresses: string[] = this._addresses,
			oldSettings = this._remoteSettings;

		for (let addr of addresses) {
			if (await this.attemptFetch(addr)) {
				// Move this address onto top of list
				let pos = addresses.indexOf(addr);
				if (pos != 0) {
					addresses.splice(pos, 1);
					addresses.unshift(addr);
				}

				this.broadCastChanges(oldSettings, this._remoteSettings);
				if (this._refetchTimer === undefined) {
					this.updateSelf();
					this.repeatFetch();
				}
				// Stop trying if success
				return true;
			}
		}

		// Don't throw error on refetching
		if (this._refetchTimer === undefined) {
			throw new CriticalException('Cannot connect to any address of Configuration Service!');
		}
	}

	public onUpdate(listener: (changedKeys: string[]) => void): void {
		this._eventEmitter.on('updated', listener);
	}

	private applySettings(): string[] {
		this.refetchInterval = this.get(S.SETTINGS_REFETCH_INTERVAL) || (5 * 60000); // Default 5 mins
		try {
			let addresses: string[] = JSON.parse(this.get(S.SETTINGS_SERVICE_ADDRESSES));
			return (addresses && addresses.length) ? addresses : null;
		} catch (err) {
			console.warn(err);
			return null;
		}
	}

	private updateSelf(): void {
		this._eventEmitter.prependListener('updated', (changedKeys: string[]) => {
			if (changedKeys.includes(S.SETTINGS_REFETCH_INTERVAL) || changedKeys.includes(S.SETTINGS_SERVICE_ADDRESSES)) {
				let addresses = this.applySettings();
				if (addresses) {
					this._addresses = addresses;
				} else {
					console.warn('New SettingService addresses are useless!');
				}
			}
		});
	}

	private repeatFetch(): void {
		this._refetchTimer = setInterval(() => this.fetch(), this.refetchInterval);
	}

	private stopRefetch(): void {
		clearInterval(this._refetchTimer);
		this._refetchTimer = null;
	}


	private async attemptFetch(address: string): Promise<boolean> {
		try {
			let serviceName = this.get(S.SERVICE_SLUG),
				ipAddress = '0.0.0.0'; // If this service runs inside a Docker container, 
								// this should be the host's IP address.

			this._rpcCaller.baseAddress = address;
			let req = GetSettingRequest.translator.whole({
				slug: serviceName,
				ipAddress
			});

			let res: IRpcResponse = await this._rpcCaller.call(M.PROGRAM_CONFIGURATION, A.GET_SETTINGS, req);
			if (res.isSuccess) {
				this._remoteSettings = this.parseSettings(res.payload);
				return true;
			}
		} catch (err) {
			console.warn(err);
		}
		return false;
	}

	private broadCastChanges(oldSettings, newSettings): void {
		if (!newSettings) { return; }
		let oldKeys = Object.getOwnPropertyNames(oldSettings),
			newKeys = Object.getOwnPropertyNames(newSettings),
			changedKeys: string[] = [],
			val;

		// Update existing values or add new keys
		for (let key of newKeys) {
			val = newSettings[key];
			if (val !== oldSettings[key]) {
				changedKeys.push(key);
			}
		}

		// Reset abandoned keys.
		for (let key of oldKeys) {
			if (!newKeys.includes(key)) {
				changedKeys.push(key);
			}
		}

		if (changedKeys.length) {
			this._eventEmitter.emit('updated', changedKeys);
		}
	}

	private parseSettings(raw) {
		if (!raw) { return {}; }

		let map = {},
			settings: SettingItem[] = SettingItem.translator.whole(raw);
		for (let st of settings) {
			map[st.name] = this.parseValue(st.value, st.dataType);
		}
		return map;
	}

	private parseValue(val, type) {
		if (val === undefined) { return null; }

		if (type == SettingItemDataType.String) {
			return val;
		} else {
			return JSON.parse(val);
		}
	}
}