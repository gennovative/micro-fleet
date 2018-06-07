export enum SvcSettingKeys {
	/**
	 * Number of milliseconds to wait before actually stop addons.
	 * Date type: number
	 */
	ADDONS_DEADLETTER_TIMEOUT = 'addons_deadletter_timeout',

	/**
	 * Array of addresses to SettingService.
	 * Data type: string[]
	 */
	SETTINGS_SERVICE_ADDRESSES = 'settings_service_addresses',

	/**
	 * Array of addresses to IdGeneratorService.
	 * Data type: string[]
	 */
	ID_SERVICE_ADDRESSES = 'id_service_addresses',

	/**
	 * Number of milliseconds between refetchings.
	 * Date type: number
	 */
	SETTINGS_REFETCH_INTERVAL = 'settings_refetch_interval',

	/**
	 * Service URL-safe name.
	 * Data type: string
	 */
	SERVICE_SLUG = 'service_slug',
}