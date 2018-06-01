import { expect } from 'chai';

import { PagedArray } from '../app';


describe('PagedArray', () => {
	it('Should create an empty array', () => {
		// Act
		let arr = new PagedArray();
		
		expect(Array.isArray(arr)).to.be.true;
		expect(arr.length).to.equal(0);
		expect(arr.total).to.equal(0);
	});

	it('Should initialize with one value', () => {
		// Act
		let arr = new PagedArray(100, 'a');
		
		// Assert
		expect(Array.isArray(arr)).to.be.true;
		expect(arr.length).to.equal(1);
		expect(arr.total).to.equal(100);
	});

	it('Should initialize with multiple values', () => {
		// Act
		let arr = new PagedArray(100, 'a', 'b', 'c');
		
		// Assert
		expect(Array.isArray(arr)).to.be.true;
		expect(arr.length).to.equal(3);
		expect(arr.total).to.equal(100);
	});

	it('Should support normal array functions', () => {
		// Act
		let arr = new PagedArray(100, 'a', 'b', 'c');
		
		let pagedStr = arr.concat(['d', 'e']).join(','),
			normalStr = ['a', 'b', 'c', 'd', 'e'].join(',');

		// Assert
		expect(pagedStr).to.equal(normalStr);
	});

	it('Should support normal array functions', () => {
		// Act
		let arr = new PagedArray(100, 'a', 'b', 'c');
		
		let pagedStr = arr.concat(['d', 'e']).join(','),
			normalStr = ['a', 'b', 'c', 'd', 'e'].join(',');

		// Assert
		expect(pagedStr).to.equal(normalStr);
	});

	describe('asObject', () => {
		it('Should return a serializable object.', () => {
			// Arrange
			let pagedArr = new PagedArray(100, 'a', 'b', 'c'),
				normalArr = ['a', 'b', 'c'];

			// Act
			let obj = pagedArr.asObject();

			// Assert
			expect(obj.total).to.equal(pagedArr.total);
			expect(obj.data).to.deep.equal(normalArr);
		});
	});
});