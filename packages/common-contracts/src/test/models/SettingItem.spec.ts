import { expect } from 'chai';
import { NotImplementedException } from '@micro-fleet/common-util';

import { SettingItem, SettingItemDataType } from '../../app/models/settings/SettingItem';


describe('SettingItem\'s validator', () => {
	describe('whole', () => {
		it('Should return the validated object if valid', () => {
			// Arrange
			let targetOne = {
					name: 'database_host',
					dataType: SettingItemDataType.String,
					value: '127.0.0.1'
				},
				targetTwo: any = new SettingItem();

			targetTwo.name = 'max_conn';
			targetTwo.dataType = SettingItemDataType.Number;
			targetTwo.value = '199';

			// Act
			let validator = SettingItem.validator,
				[errorOne, validatedOne] = validator.whole(targetOne),
				[errorTwo, validatedTwo] = validator.whole(targetTwo);

			// Assert
			expect(errorOne).not.to.exist;
			expect(validatedOne).to.exist;
			expect(validatedOne.name).to.equal(targetOne.name);
			expect(validatedOne.dataType).to.equal(targetOne.dataType);
			expect(validatedOne.value).to.equal(targetOne.value);
			
			expect(errorTwo).not.to.exist;
			expect(validatedTwo).to.exist;
			expect(validatedTwo.name).to.equal(targetTwo.name);
			expect(validatedTwo.dataType).to.equal(targetTwo.dataType);
			expect(validatedTwo.value).to.equal(targetTwo.value);
		});

		it('Should return an err object if invalid', () => {
			// Arrange
			let targetOne = {
				},
				targetTwo = {
					name: '',
					dataType: '',
					value: ''
				},
				targetThree = {
					name: 'max conn', // Space is not allowed.
					dataType: SettingItemDataType.Number,
					value: 12 // `value` must be string, although `dataType` may be number.
				};

			// Act
			let validator = SettingItem.validator,
				[errorOne, validatedOne] = validator.whole(targetOne),
				[errorTwo, validatedTwo] = validator.whole(targetTwo),
				[errorThree, validatedThree] = validator.whole(targetThree);

			// Assert
			expect(errorOne).to.exist;
			expect(validatedOne).not.to.exist;
			
			expect(errorTwo).to.exist;
			expect(validatedTwo).not.to.exist;
			
			expect(errorThree).to.exist;
			expect(validatedThree).not.to.exist;
		});
	}); // END describe 'whole'
});