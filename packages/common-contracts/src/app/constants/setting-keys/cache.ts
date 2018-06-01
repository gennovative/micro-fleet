export enum CacheSettingKeys {
	/**
	 * Number of cache servers in cluster.
	 * Data type: number
	 */
	CACHE_NUM_CONN = 'cache_num_conn',

	/**
	 * IP or host name of cache service. 
	 * Must use with connection index: CACHE_HOST + '0', CACHE_HOST + '1'
	 * Data type: string
	 */
	CACHE_HOST = 'cache_host_',

	/**
	 * Port number.
	 * Data type: number
	 */
	CACHE_PORT = 'db_port_'
}