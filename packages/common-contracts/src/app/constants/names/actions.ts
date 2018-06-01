export enum ActionNames {

	/**
	 * Assign to group
	 */
	ASSIGN_TO_GROUP = 'assignToGroup',

	/**
	 * Can deploy
	 */
	CAN_DEPLOY = 'canDeploy',

	/**
	 * Create
	 */
	CREATE = 'create',

	/**
	 * Count all
	 */
	COUNT_ALL = 'countAll',

	/**
	 * Configure program
	 */
	CONFIGURE_PROGRAM = 'configureProgram',

	/**
	 * Configure program group
	 */
	CONFIGURE_PROGRAM_GROUP = 'configureProgramGroup',

	/**
	 * Deploy
	 */
	DEPLOY = 'deploy',

	/**
	 * Soft delete
	 */
	DELETE_SOFT = 'deleteSoft',

	/**
	 * Hard delete
	 */
	DELETE_HARD = 'deleteHard',

	/**
	 * Hard delete versions
	 */
	DELETE_HARD_VERSIONS = 'deleteHardVersions',

	/**
	 * Exists
	 */
	EXISTS = 'exists',
	
	/**
	 * Find by PK
	 */
	FIND_BY_PK = 'findByPk',

	/**
	 * Get by host ID
	 */
	GET_BY_HOST_ID = 'getByHostId',

	/**
	 * Get by program slug
	 */
	GET_BY_PROGRAM_SLUG = 'getByProgramSlug',

	/**
	 * Get by program ID
	 */
	GET_BY_PROGRAM_ID = 'getByProgramId',

	/**
	 * Get settings
	 */
	GET_SETTINGS = 'getSettings',

	/**
	 * Get programs
	 */
	GET_PROGRAMS = 'getPrograms',

	/**
	 * Next big int
	 */
	NEXT_BIG_INT = 'nextBigInt',

	/**
	 * Next short ID
	 */
	NEXT_SHORT_ID = 'nextShortId',

	/**
	 * Next version-4 UUID
	 */
	NEXT_UUID_V4 = 'nextUuidv4',

	/**
	 * Page
	 */
	PAGE = 'page',

	/**
	 * Page
	 */
	PAGE_VERSIONS = 'pageVersions',

	/**
	 * Patch
	 */
	PATCH = 'patch',

	/**
	 * Recover
	 */
	RECOVER = 'recover',

	/**
	 * Restrict quantity
	 */
	RESTRICT_QUANTITY = 'restrictQuantity',

	/**
	 * Recover
	 */
	SET_AS_MAIN = 'setAsMain',

	/**
	 * Upload
	 */
	UPLOAD = 'upload',

	/**
	 * Update
	 */
	UPDATE = 'update',
}