import { expect } from 'chai';

import { EntityBase } from '../app';

const TABLE_NAME = 'tblGood';

class BadEntity extends EntityBase {

}

class GoodEntity extends EntityBase {
	/* override */ static get tableName(): string {
		return TABLE_NAME;
	}
}

describe('EntityBase', () => {
	describe('get tableName', () => {
		it('should throw exception if not overriden', () => {
			let exception = null,
				table = null;

			try {
				table = BadEntity.tableName;
			} catch (ex) {
				exception = ex;
			}

			expect(exception).to.be.not.null;
			expect(table).to.be.null;
		});
		
		it('should return table name if overriden', () => {
			let exception = null,
				table = null;

			try {
				table = GoodEntity.tableName;
			} catch (ex) {
				exception = ex;
			}

			expect(exception).to.be.null;
			expect(table).to.equal(TABLE_NAME);
		});
	});
});