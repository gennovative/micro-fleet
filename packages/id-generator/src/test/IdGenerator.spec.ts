import * as chai from 'chai';
import * as spies from 'chai-spies';
import { Int64BE } from 'int64-buffer';

import { IdGenerator } from '../app';


chai.use(spies);
const expect = chai.expect;

describe('IdGenerator', () => {
	describe('nextBigInt', () => {
		it('Should generate different numbers on each call', () => {
			let idGen = new IdGenerator();
			expect(idGen.nextBigInt()).not.to.equal(idGen.nextBigInt());
		});
	}); // END describe 'nextBigInt'

	describe('nextShortId', () => {
		it('Should generate different numbers on each call', () => {
			let idGen = new IdGenerator({ worker: 2 });
			expect(idGen.nextShortId()).not.to.equal(idGen.nextShortId());
		});
	}); // END describe 'nextShortId'

	describe('nextUuidv4', () => {
		it('Should generate different numbers on each call', () => {
			let idGen = new IdGenerator();
			expect(idGen.nextUuidv4()).not.to.equal(idGen.nextUuidv4());
		});
	}); // END describe 'nextUuidv4'

	describe('wrapBigInt', () => {
		it('Should call next() internally if no argument is given.', () => {
			// Arrange
			let idGen = new IdGenerator(),
				nextSpy = chai.spy.on(idGen, 'nextBigInt');

			// Act
			idGen.wrapBigInt();

			// Assert
			expect(nextSpy).to.be.called.once;
		});

		it('Should wrap the input.', () => {
			// Arrange
			let idGen = new IdGenerator(),
				input = '12345';

			// Act
			let bigId = idGen.wrapBigInt(input);
			let another = new Int64BE(input);

			// Assert
			expect(bigId.toNumber()).to.equal(parseInt(input));
		});
	}); // END describe 'wrapBigInt'
});