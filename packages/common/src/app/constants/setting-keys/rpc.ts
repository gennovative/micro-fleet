export enum RpcSettingKeys {
	/**
	 * Number of milliseconds after which RPC caller stops waiting for response.
	 * Data type: number
	 */
	RPC_CALLER_TIMEOUT = 'rpc_caller_timeout',

	/**
	 * Http port to which HTTP RPC handler listens.
	 * Data type: number
	 */
	RPC_HANDLER_PORT = 'rpc_handler_port',
}