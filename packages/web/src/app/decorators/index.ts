if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
	require('reflect-metadata');
}

import { lazyInject, LazyInjectDecorator } from './lazyInject';
import { controller, ControllerDecorator } from './controller';
import { filter, FilterDecorator } from './filter';
import { action, ActionDecorator } from './action';


export const decorators: {
	/**
	 * Used to decorate action function of REST controller class.
	 * @param {string} path Segment of URL pointing to this controller.
	 * 		If not specified, it is default to be empty tring.
	 */
	action: ActionDecorator,

	/**
	 * Used to add filter to controller class and controller action.
	 * @param {class} FilterClass Filter class.
	 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
	 * 		This array function won't be executed, but is used to extract filter function name.
	 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
	 */
	filter: FilterDecorator,

	/**
	 * Used to decorate REST controller class.
	 * @param {string} path Segment of URL pointing to this controller,
	 * 		if not specified, it is extract from controller class name: {path}Controller.
	 */
	controller: ControllerDecorator,
	/**
	 * Injects value to the decorated property. 
	 * Used to decorate properties of a class that's cannot be resolved by dependency container.
	 */
	lazyInject: LazyInjectDecorator
} = {
	action,
	controller,
	filter,
	lazyInject
};
