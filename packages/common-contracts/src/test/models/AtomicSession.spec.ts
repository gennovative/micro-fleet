import { expect } from 'chai';

import { AtomicSession } from '../../app';


describe('AtomicSession', () => {
	it('Should a create an instance (for test coverage purpose)', () => {
		console.warn('Should look at back-lib-persistence > RepositoryBase unit test to know how to use AtomicSession.');
		expect(new AtomicSession(null, null)).to.exist;
	});
});