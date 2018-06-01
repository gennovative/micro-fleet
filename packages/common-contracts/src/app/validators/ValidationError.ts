import * as joi from 'joi';
import { Exception, MinorException } from '@micro-fleet/common-util';


/**
 * Represents a validation error for a property.
 * UI Form should use this information to highlight the particular input.
 */
export interface IValidationErrorItem {
	/**
	 * Error message for this item.
	 */
	message: string;

	/**
	 * Path to the target property in validation schema.
	 */
	path: string[];

	/**
	 * The invalid property value.
	 */
	value: any;
}

/**
 * Represents an error when a model does not pass validation.
 */
export class ValidationError extends MinorException {
	
	public readonly details: IValidationErrorItem[];


	constructor(joiDetails: joi.ValidationErrorItem[]) {
		super(null);
		this.name = 'ValidationError';
		this.details = this.parseDetails(joiDetails);
		Error.captureStackTrace(this, ValidationError);
	}

	private parseDetails(joiDetails: joi.ValidationErrorItem[]): IValidationErrorItem[] {
		let details = [];
		/* istanbul ignore next */
		if (!joiDetails || !joiDetails.length) { return details; }

		joiDetails.forEach(d => {
			details.push({
				message: d.message,
				path: d.path,
				value: d.context.value
			});
		});

		return details;
	}
}