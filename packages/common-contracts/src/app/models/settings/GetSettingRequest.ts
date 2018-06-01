import * as joi from 'joi';
import { NotImplementedException } from '@micro-fleet/common-util';

import { ModelAutoMapper } from '../../translators/ModelAutoMapper';
import { JoiModelValidator } from '../../validators/JoiModelValidator';


/**
 * Represents the request contract for GetSetting endpoint.
 */
export class GetSettingRequest {

	public static validator: JoiModelValidator<GetSettingRequest>;
	public static translator: ModelAutoMapper<GetSettingRequest>;

	/**
	 * Gets or sets program slug.
	 */
	public readonly slug: string = undefined;

	/**
	 * Gets or sets IP address where the calling program is running.
	 */
	public readonly ipAddress: string = undefined;
}

let validator = GetSettingRequest.validator = JoiModelValidator.create({
	slug: joi.string().regex(/^[0-9a-zA-z-]+$/).required().example('SettingSvc').example('setting-svc'),
	ipAddress: joi.string().ip().required().example('127.0.0.1').example('192.168.10.23')
}, false, false);

validator.partial = function() {
	throw new NotImplementedException('This method is not supported. Use `whole` instead.');
};

GetSettingRequest.translator = new ModelAutoMapper(GetSettingRequest, validator);