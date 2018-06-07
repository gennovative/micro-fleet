import { expect } from 'chai';
import * as joi from 'joi';

import { JoiModelValidator } from '../../app';
import { SampleModel } from './SampleModel';


let validator: JoiModelValidator<SampleModel>;

describe('JoiModelValidator', () => {
	beforeEach(() => {
		validator = JoiModelValidator.create<SampleModel>(
			{
				name: joi.string().regex(/^[\d\w -]+$/u).max(10).min(3).required(),
				address: joi.string().required(),
				age: joi.number().min(15).max(99).integer().optional(),
				gender: joi.only('male', 'female').optional()
			},
			null,
			false,
			{ theID: joi.number().min(1).max(Number.MAX_SAFE_INTEGER) }
		);
	});

	describe('getters', () => {
		it('schemaMap', () => {
			expect(validator.schemaMap).to.equal(validator['_schemaMap']);
		});

		it('schemaMapId', () => {
			expect(validator.schemaMapPk).to.equal(validator['_schemaMapPk']);
		});

		it('isCompoundPk', () => {
			expect(validator.isCompoundPk).to.equal(validator['_isCompositePk']);
		});
	}); // END describe 'getters'

	describe('pk', () => {
		it('Should return the validated single PK if valid', () => {
			// Arrange
			let theID = 999;

			// Act
			let [error, pk] = validator.pk(theID);

			// Assert
			if (error) { console.error(error); }
			expect(error).not.to.exist;
			expect(pk).to.exist;
			expect(pk).to.equal(theID);
		});

		it('Should return the validated compound PK if valid', () => {
			// Arrange
			let validator = JoiModelValidator.create<SampleModel>(
					{ name: joi.string() },
					true,
					true,
					{
						id: joi.string().required(),
						tenantId: joi.string().required()
					}
				),
				target = <TenantPk>{
					id: '999',
					tenantId: '888'
				};

			// Act
			let [error, pk] = validator.pk(target);

			// Assert
			if (error) { console.error(error); }
			expect(error).not.to.exist;
			expect(pk).to.exist;
			expect(pk.id).to.equal(target.id);
			expect(pk.tenantId).to.equal(target.tenantId);
		});

		it('Should return an error object if invalid', () => {
			// Arrange
			let theID = 0;

			// Act
			let [error, pk] = validator.pk(theID);

			// Assert
			expect(pk).not.to.exist;
			expect(error).to.exist;
			expect(error.details[0].path.length).to.equal(0);
			expect(error.details[0].message).to.equal('"value" must be larger than or equal to 1');
		});
	}); // END describe 'id'

	describe('whole', () => {
		it('Should return the validated object if valid', () => {
			// Arrange
			let targetOne = {
					name: 'Gennova123',
					address: 'Unlimited length street name',
					age: 18,
					gender: 'male'
				},
				targetTwo = {
					name: 'gen-no-va',
					address: '^!@'
				};

			// Act
			let [errorOne, validatedOne] = validator.whole(targetOne),
				[errorTwo, validatedTwo] = validator.whole(targetTwo);

			// Assert
			if (errorOne) {
				console.error(errorOne);
			}
			expect(errorOne).not.to.exist;
			expect(validatedOne).to.exist;
			expect(validatedOne.name).to.equal(targetOne.name);
			expect(validatedOne.address).to.equal(targetOne.address);
			expect(validatedOne.age).to.equal(targetOne.age);
			expect(validatedOne.gender).to.equal(targetOne.gender);
			
			if (errorTwo) {
				console.error(errorTwo);
			}
			expect(errorTwo).not.to.exist;
			expect(validatedTwo).to.exist;
			expect(validatedTwo.name).to.equal(targetTwo.name);
			expect(validatedTwo.address).to.equal(targetTwo.address);
			expect(validatedTwo.age).not.to.exist;
			expect(validatedTwo.gender).not.to.exist;
		});

		it('Should remove unknown properties if valid', () => {
			// Arrange
			let target = {
					name: 'Gennova123',
					address: 'Unlimited length street name',
					hobbies: ['sport', 'books'],
					loveMovie: false
				};

			// Act
			let [error, value] = validator.whole(target);

			// Assert
			if (error) {
				console.error(error);
			}
			expect(error).not.to.exist;
			expect(value).to.exist;
			expect(value.name).to.equal(target.name);
			expect(value.address).to.equal(target.address);
			expect(value['hobbies']).not.to.exist;
			expect(value['loveMovie']).not.to.exist;
		});

		it('Should validate model ID if required', () => {
			// Arrange
			let validator = JoiModelValidator.create<SampleModel>(
					{
						name: joi.string().regex(/^[\d\w -]+$/u).max(10).min(3).required(),
						address: joi.string().required(),
						age: joi.number().min(15).max(99).integer().optional(),
						gender: joi.only('male', 'female').optional()
					},
					null,
					true
				),
				target = {
					name: 'Gennova123',
					address: 'Unlimited length street name',
					age: 18,
					gender: 'male'
				};

			// Act
			let [error, validated] = validator.whole(target);

			// Assert
			expect(validated).not.to.exist;
			expect(error).to.exist;
			expect(error.details[0].path.length).to.equal(1);
			expect(error.details[0].path[0]).to.equal('id');
			expect(error.details[0].message).to.equal('"id" is required');
		});

		it('Should validate compound PK if required', () => {
			// Arrange
			let validator = JoiModelValidator.create<SampleModel>(
					{ name: joi.string() },
					true,
					true
				),
				target = {
					name: 'Gennova123'
				};

			// Act
			let [error, validated] = validator.whole(target);

			// Assert
			expect(validated).not.to.exist;
			expect(error).to.exist;
			expect(error.details.length).to.equal(2);
			expect(error.details[0].path.length).to.equal(1);
			expect(error.details[0].path[0]).to.equal('id');
			expect(error.details[0].message).to.equal('"id" is required');
			expect(error.details[1].path.length).to.equal(1);
			expect(error.details[1].path[0]).to.equal('tenantId');
			expect(error.details[1].message).to.equal('"tenantId" is required');
		});

		it('Should return an error object if invalid', () => {
			// Arrange
			let targetOne = {
				},
				targetTwo = {
					name: 'ab',
					address: '',
					age: '10'
				},
				targetThree = {
					name: 'too long name w!th inv@lid ch@racters',
					address: <any>null,
					age: 10,
					gender: 'homo'
				};

			// Act
			let [errorOne, validatedOne] = validator.whole(targetOne),
				[errorTwo, validatedTwo] = validator.whole(targetTwo),
				[errorThree, validatedThree] = validator.whole(targetThree);

			// Assert
			expect(validatedOne).not.to.exist;
			expect(errorOne).to.exist;
			
			expect(validatedTwo).not.to.exist;
			expect(errorTwo).to.exist;
			
			expect(validatedThree).not.to.exist;
			expect(errorThree).to.exist;
		});

		it('Should return error details if invalid', () => {
			// Arrange
			let targetOne = {
				},
				targetTwo = {
					name: <any>null,
					address: '',
					age: '10'
				},
				targetThree = {
					name: 'too long name w!th inv@lid ch@racters',
					address: <any>null,
					age: 10,
					gender: 'homo'
				};

			// Act
			let [errorOne, validatedOne] = validator.whole(targetOne),
				[errorTwo, validatedTwo] = validator.whole(targetTwo),
				[errorThree, validatedThree] = validator.whole(targetThree);

			// Assert
			expect(validatedOne).not.to.exist;
			expect(errorOne).to.exist;
			expect(errorOne.details).to.have.length(2);
			expect(errorOne.details[0].path.length).to.equal(1);
			expect(errorOne.details[0].path[0]).to.equal('name');
			expect(errorOne.details[0].message).to.equal('"name" is required');
			expect(errorOne.details[1].path.length).to.equal(1);
			expect(errorOne.details[1].path[0]).to.equal('address');
			expect(errorOne.details[1].message).to.equal('"address" is required');
			
			expect(validatedTwo).not.to.exist;
			expect(errorTwo).to.exist;
			expect(errorTwo.details).to.have.length(3);
			expect(errorTwo.details[0].path.length).to.equal(1);
			expect(errorTwo.details[0].path[0]).to.equal('name');
			expect(errorTwo.details[0].message).to.equal('"name" must be a string');
			expect(errorTwo.details[1].path.length).to.equal(1);
			expect(errorTwo.details[1].path[0]).to.equal('address');
			expect(errorTwo.details[1].message).to.equal('"address" is not allowed to be empty');
			expect(errorTwo.details[2].path.length).to.equal(1);
			expect(errorTwo.details[2].path[0]).to.equal('age');
			expect(errorTwo.details[2].message).to.equal('"age" must be larger than or equal to 15');
			
			expect(validatedThree).not.to.exist;
			expect(errorThree).to.exist;
			expect(errorThree.details).to.have.length(5);
			expect(errorThree.details[0].path.length).to.equal(1);
			expect(errorThree.details[0].path[0]).to.equal('name');
			expect(errorThree.details[0].message).to.contain('fails to match the required pattern');
			expect(errorThree.details[1].path.length).to.equal(1);
			expect(errorThree.details[1].path[0]).to.equal('name');
			expect(errorThree.details[1].message).to.equal('"name" length must be less than or equal to 10 characters long');
			expect(errorThree.details[2].path.length).to.equal(1);
			expect(errorThree.details[2].path[0]).to.equal('address');
			expect(errorThree.details[2].message).to.equal('"address" must be a string');
			expect(errorThree.details[3].path.length).to.equal(1);
			expect(errorThree.details[3].path[0]).to.equal('age');
			expect(errorThree.details[3].message).to.equal('"age" must be larger than or equal to 15');
			expect(errorThree.details[4].path.length).to.equal(1);
			expect(errorThree.details[4].path[0]).to.equal('gender');
			expect(errorThree.details[4].message).to.equal('"gender" must be one of [male, female]');
		});
	}); // END describe 'whole'

	describe('partial', () => {
		it('Should only validate existing properties', () => {
			// Arrange
			let target = {
					theID: 1,
					name: 'Long invalid name',
					// address: '^!@' => address is not specified
				};

			// Act
			let [error, validated] = validator.partial(target);

			// Assert
			expect(validated).not.to.exist;
			expect(error).to.exist;
			expect(error.details.length).to.equal(1);
			expect(error.details[0].path.length).to.equal(1);
			expect(error.details[0].path[0]).to.equal('name');
			//=> No "required" error for `address`.
		});

		it('Should ignore `required` validation, but not allow `null` value', () => {
			// Arrange
			let targetOne = {
				},
				targetTwo = {
					name: <any>null,
					age: <any>null
				};

			// Act
			let [errorOne, validatedOne] = validator.partial(targetOne),
				[errorTwo, validatedTwo] = validator.partial(targetTwo);

			// Assert: `required` validation is ignored.
			expect(validatedOne).to.exist;
			expect(errorOne).not.to.exist;

			// Assert: `required` properties don't allow `null`.
			expect(validatedTwo).not.to.exist;
			expect(errorTwo).to.exist;
			expect(errorTwo.details).to.have.length(2);
			expect(errorTwo.details[0].path.length).to.equal(1);
			expect(errorTwo.details[0].path[0]).to.equal('name');
			expect(errorTwo.details[0].message).to.equal('"name" must be a string');
			expect(errorTwo.details[1].path.length).to.equal(1);
			expect(errorTwo.details[1].path[0]).to.equal('age');
			expect(errorTwo.details[1].message).to.equal('"age" must be a number');
		});
	}); // END describe 'partial'
});