import { DbClient } from './DbClient';
import { ServicePorts } from './ports';
import { ActionNames } from './names/actions';
import { ModuleNames } from './names/modules';
import { CacheSettingKeys } from './setting-keys/cache';
import { DbSettingKeys } from './setting-keys/database';
import { MbSettingKeys } from './setting-keys/message-broker';
import { RpcSettingKeys } from './setting-keys/rpc';
import { SvcSettingKeys } from './setting-keys/service';


export type Constants = {
	DbClient: typeof DbClient,
	ServicePorts: typeof ServicePorts,
	ActionNames: typeof ActionNames,
	ModuleNames: typeof ModuleNames,
	CacheSettingKeys: typeof CacheSettingKeys,
	DbSettingKeys: typeof DbSettingKeys,
	MbSettingKeys: typeof MbSettingKeys,
	RpcSettingKeys: typeof RpcSettingKeys,
	SvcSettingKeys: typeof SvcSettingKeys 
};

export const constants: Constants = { DbClient, ServicePorts, ActionNames, ModuleNames, CacheSettingKeys,
	DbSettingKeys, MbSettingKeys, RpcSettingKeys, SvcSettingKeys };