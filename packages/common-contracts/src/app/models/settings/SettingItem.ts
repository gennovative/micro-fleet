import * as joi from 'joi';

import { ModelAutoMapper } from '../../translators/ModelAutoMapper';
import { JoiModelValidator } from '../../validators/JoiModelValidator';


export enum SettingItemDataType { 
	/**
	 * Text data type, that is rendered as a text box on UI.
	 */
	String = 'string',

	/**
	 * Array of strings.
	 */
	StringArray = 'string[]',

	/**
	 * Numeric data type including integer and float, that is rendered as
	 * a numeric box on UI.
	 */
	Number = 'number',

	/**
	 * Array of numbers.
	 */
	NumberArray = 'number[]',

	/**
	 * Logical data type (true/false), that is rendered as a checkbox on UI.
	 */
	Boolean = 'boolean'
}

/**
 * Represents a setting record.
 */
export class SettingItem {

	public static validator: JoiModelValidator<SettingItem>;
	public static translator: ModelAutoMapper<SettingItem>;

	/**
	 * Gets or sets setting name (aka setting key).
	 * This is also the key in `appconfig.json` and the name of environment variable.
	 */
	public readonly name: string = undefined;

	/**
	 * Gets or sets data type of setting value.
	 * Must be one of: 'string', 'string[]', 'number', 'number[]', 'boolean'.
	 */
	public readonly dataType: SettingItemDataType = undefined;

	/**
	 * Gets or set value.
	 * Whatever `dataType` is, value must always be string.
	 */
	public readonly value: string = undefined;
}

SettingItem.validator = JoiModelValidator.create({
	name: joi.string().token().required(),
	dataType: joi.string().required().only(SettingItemDataType.String, SettingItemDataType.StringArray, SettingItemDataType.Number, SettingItemDataType.NumberArray, SettingItemDataType.Boolean),
	value: joi.string().allow('').required()
}, false, false);

SettingItem.translator = new ModelAutoMapper(SettingItem, SettingItem.validator);