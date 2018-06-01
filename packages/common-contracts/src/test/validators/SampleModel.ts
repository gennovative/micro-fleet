import * as joi from 'joi';

import { JoiModelValidator } from '../../app';


export class SampleModel {
	public static validator: JoiModelValidator<SampleModel>;

	public readonly theID: number = undefined; // It's IMPORTANT to initialize property with a value.
	public readonly name: string = undefined;
	public readonly address: string = undefined;
	public readonly age: number = undefined;
	public readonly gender: 'male' | 'female' = undefined;
}

SampleModel.validator = JoiModelValidator.create<SampleModel>(
	{
		name: joi.string().regex(/^[\d\w -]+$/u).max(10).min(3).required(),
		address: joi.string().required(),
		age: joi.number().min(15).max(99).integer()
			.allow(null).optional(), // This pair (allow, optional) must go together.
		gender: joi.only('male', 'female').allow(null).optional()
	},
	null,
	false,
	{ 
		theID: joi.number().min(1).max(Number.MAX_SAFE_INTEGER).required() 
	}
);
