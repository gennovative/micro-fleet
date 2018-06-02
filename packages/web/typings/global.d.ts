
/**
 * This file is for global definitions.
 */

type TrailsRouteConfigItem = {
	method: string | string[],
	path: string,
	handler: string | Function,
	config?: any
};
