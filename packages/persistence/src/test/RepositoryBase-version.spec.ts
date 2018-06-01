import { expect } from 'chai';

import { InvalidArgumentException, MinorException } from '@micro-fleet/common-util';
import { PagedArray, ModelAutoMapper, constants } from '@micro-fleet/common-contracts';
import { IdGenerator } from '@micro-fleet/id-generator';

import {
	RepositoryBase, EntityBase, QueryCallback, IDatabaseConnector,
	KnexDatabaseConnector, AtomicSessionFactory, AtomicSessionFlow, AtomicSession,
} from '../app';
import DB_DETAILS from './database-details';

const { DbClient } = constants;


const CONN_FILE = `${process.cwd()}/database-adapter-test.sqlite`,
	CONN_FILE_2 = `${process.cwd()}/database-adapter-test-second.sqlite`,
	// For SQLite3 file
	// DB_TABLE = 'userdata',

	// For PostgreSQL
	DB_TABLE = 'userdata_version',

	IMPOSSIBLE_ID = '0';


// Should put this in Types.ts
const TYPE_USER_DTO = Symbol('UserVersionDTO'),
	TYPE_USER_ENT = Symbol('UserVersionEntity');

class UserVersionDTO implements IModelDTO, ISoftDeletable, IVersionControlled {

	public static translator: ModelAutoMapper<UserVersionDTO> = new ModelAutoMapper(UserVersionDTO);

	// NOTE: Class properties must be initialized, otherwise they
	// will disappear in transpiled code.
	public id: BigInt = undefined;
	public name: string = undefined;
	public age: number = undefined;
	public deletedAt: Date = undefined;
	public createdAt: Date = undefined;
	public version: number = undefined;
	public isMain: boolean = undefined;
}

class UserVersionEntity extends EntityBase {
	/**
	 * @override
	 */
	public static get tableName(): string {
		return DB_TABLE;
	}

	public static readonly idColumn = ['id'];
	public static readonly uniqColumn = ['name', 'age'];

	public static translator: ModelAutoMapper<UserVersionEntity> = new ModelAutoMapper(UserVersionEntity);

	// NOTE: Class properties must be initialized, otherwise they
	// will disappear in transpiled code.
	public name: string = undefined;
	public age: number = undefined;
	public deletedAt: string = undefined;
	public createdAt: string = undefined;
	public version: number = undefined;
	public isMain: boolean = undefined;
}

class UserVersionRepo extends RepositoryBase<UserVersionEntity, UserVersionDTO> {

	private _sessionFactory: AtomicSessionFactory;

	constructor(
		dbConnector: IDatabaseConnector
	) {
		super(UserVersionEntity, dbConnector, {
			isVersionControlled: true,
			triggerProps: ['name']
		});
		this._sessionFactory = new AtomicSessionFactory(dbConnector);
	}

	public createCoupleWithTransaction(adam: UserVersionDTO, eva: UserVersionDTO): Promise<UserVersionDTO[]> {
		return this._sessionFactory.startSession()
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.pipe((atomicSession, createdAdam) => {
				if (!createdAdam) {
					debugger;
					// In fact, this scenario should never happen.
					// Because when we come to this point, the previous task must have been successfull.
					return Promise.reject('Cannot live without my husband!');
				}
				return this.create(eva, { atomicSession })
					.then(createdEva => [createdAdam, createdEva]);
			})
			.closePipe();
	}

	private _counter = 0;
	public firstOutput;
	public failOnSecondTransaction(adam: UserVersionDTO, eva: UserVersionDTO): Promise<UserVersionDTO[]> {
		return this._sessionFactory.startSession()
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.pipe((atomicSession, createdAdam) => {
				this._counter++;
				// If this is transaction of the second connection
				if (this._counter == 2) {
					return new Promise((resolve, reject) => {
						// Delay here to let first transaction to finish,
						// but throw MinorException before it resolves.
						setTimeout(() => {
							reject(new MinorException('Error on second transaction'));
						}, 100);
					});
				} else {
					return new Promise((resolve, reject) => {
						this.create(eva, { atomicSession })
							.then(createdEva => {
								this.firstOutput = [createdAdam, createdEva];
								// First transaction has finished but not yet resolves,
								// it must delay here to let second transaction to fail
								setTimeout(() => {
									resolve(this.firstOutput);
								}, 200);
							});
					});
				}
			})
			.closePipe();
	}

	public createAdamOnSecondConn(adam: UserVersionDTO): Promise<UserVersionDTO> {
		return this._sessionFactory.startSession('sec')
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.closePipe();
	}

	public createAdamOnNonExistConn(adam: UserVersionDTO): Promise<UserVersionDTO> {
		return this._sessionFactory.startSession('nonexist')
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.closePipe();
	}

	public createSessionPipe(adam: UserVersionDTO, eva: UserVersionDTO): AtomicSessionFlow {
		return this._sessionFactory.startSession()
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.pipe((atomicSession, createdAdam) => {
				if (!createdAdam) {
					debugger;
					// In fact, this scenario should never happen.
					// Because when we come to this point, the previous task must have been successfull.
					return Promise.reject('Cannot live without my husband!');
				}
				return this.create(eva, { atomicSession })
					.then(createdEva => [createdAdam, createdEva]);
			});
		//.closePipe(); // Not closing pipe
	}

	public createEmptyPipe(adam: UserVersionDTO, eva: UserVersionDTO): AtomicSessionFlow {
		return this._sessionFactory.startSession()
			.pipe(session => {
				return Promise.resolve('Nothing');
			});
		//.closePipe(); // Not closing pipe
	}

	public async findOnFirstConn(id: BigInt): Promise<UserVersionDTO> {
		let foundEnt: UserVersionEntity = await this._processor.executeQuery(query => {
			return query.findById(id);
		}, null, '0'); // Executing on first connection only.

		return this._processor.toDTO(foundEnt, false);
	}

	public async findOnSecondConn(id: BigInt): Promise<UserVersionDTO> {
		let foundEnt: UserVersionEntity = await this._processor.executeQuery(query => {
			return query.findById(id);
		}, null, 'sec'); // Executing on second connection (named 'sec').

		return this._processor.toDTO(foundEnt, false);
	}

	public async deleteOnSecondConn(id: BigInt): Promise<UserVersionDTO> {
		let affectedRows = await this._processor.executeQuery(query => {
			return query.deleteById(id);
		}, null, 'sec');
		return affectedRows;
	}

	public deleteAll(): Promise<void> {
		return this._processor.executeQuery(query => query.delete());
	}
}

let cachedDTO: UserVersionDTO,
	dbConnector: IDatabaseConnector,
	usrRepo: UserVersionRepo,
	idGen = new IdGenerator();

// These test suites make real changes to SqlLite file or PostgreSQl server.
describe.skip('RepositoryBase-version', function () {
	this.timeout(50000);

	beforeEach('Initialize db adapter', () => {
		dbConnector = new KnexDatabaseConnector();
		// // For SQLite3 file
		// dbConnector.addConnection({
		// clientName: DbClient.SQLITE3,
		// filePath: CONN_FILE,
		// });

		// // For PostgreSQL
		dbConnector.init(DB_DETAILS);
		usrRepo = new UserVersionRepo(dbConnector);
	});

	afterEach('Tear down db adapter', async () => {
		await dbConnector.dispose();
		dbConnector = null;
	});

	describe('create', () => {
		it('should insert with version number', async () => {
			// Arrange
			let model = new UserVersionDTO();
			model.id = idGen.nextBigInt().toString();
			model.name = 'Hiri';
			model.age = 29;

			// Act
			let createdDTO: UserVersionDTO = cachedDTO = await usrRepo.create(model);

			// Assert
			expect(createdDTO).to.be.not.null;
			expect(createdDTO.id).to.equal(model.id);
			expect(createdDTO.name).to.equal(model.name);
			expect(createdDTO.age).to.equal(model.age);
			expect(createdDTO.version).to.equal(1);
		});

		/*
		it('should throw error if not success on all connections', async () => {
			// Arrange
			let model = new UserVersionDTO();
			model.id = idGen.nextBigInt().toString();
			model.name = 'Hiri';
			model.age = 29;

			dbConnector.addConnection({
				clientName: DbClient.SQLITE3,
				filePath: CONN_FILE_2,
			});

			// Act
			try {
				let createdDTO: UserVersionDTO = await usrRepo.create(model);
				expect(createdDTO).to.be.null;
			} catch (ex) {
				expect(ex).to.be.not.null;
			}
		});
		//*/
	}); // END describe 'create'

	describe('patch', () => {
		it('should create new version if trigger properties is modified', async () => {
			// Arrange
			let newName = 'Kara';

			// Act
			let partial: Partial<UserVersionDTO> = await usrRepo.patch({ id: cachedDTO.id, name: newName }),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(cachedDTO.id);

			// Assert
			expect(partial.id).to.equal(cachedDTO.id);
			expect(partial.name).to.equal(newName);
			expect(partial.version).to.equal(2);
			expect(refetchedDTO).to.be.not.null;
			expect(refetchedDTO.id).to.equal(cachedDTO.id);
			expect(refetchedDTO.name).to.equal(cachedDTO.name);
			expect(refetchedDTO.age).to.equal(newName);
			expect(refetchedDTO.version).to.equal(partial.version);
		});

		it('should return `null` if not found', async () => {
			// Arrange
			let newAge = 45;

			// Act
			let partial: Partial<UserVersionDTO> = await usrRepo.patch({ id: IMPOSSIBLE_ID, age: newAge }),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(IMPOSSIBLE_ID);

			// Assert
			expect(partial).to.be.null;
			// If `patch` returns `null`, but we actually find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});
	}); // END describe 'patch'

	describe('exists', () => {
		it('should return `true` if found', async () => {
			// Act
			let isExisting: boolean = await usrRepo.exists({
					name: cachedDTO.name
				}, {
					includeDeleted: true
				});

			// Assert
			expect(isExisting).to.be.true;
		});

		it('should return `false` if not found', async () => {
			// Act
			let isExisting: boolean = await usrRepo.exists({
				name: IMPOSSIBLE_ID
			});

			// Assert
			expect(isExisting).to.be.false;
		});
	}); // END describe 'exists'

	describe('findByPk', () => {
		it('should return an model instance if found', async () => {
			// Act
			let foundDTO: UserVersionDTO = await usrRepo.findByPk(cachedDTO.id);

			// Assert
			expect(foundDTO).to.be.not.null;
			expect(foundDTO.id).to.equal(cachedDTO.id);
			expect(foundDTO.name).to.equal(cachedDTO.name);
			expect(foundDTO.age).to.equal(cachedDTO.age);
			expect(foundDTO.version).to.equal(1);
		});

		it('should return `null` if not found', async () => {
			// Act
			let model: UserVersionDTO = await usrRepo.findByPk(IMPOSSIBLE_ID);

			// Assert
			expect(model).to.be.null;
		});
	}); // END describe 'findByPk'

	describe('update', () => {
		it('should create new version if trigger properties is modified', async () => {
			// Arrange
			let newName = 'Brian',
				updatedDTO: UserVersionDTO = Object.assign(new UserVersionDTO, cachedDTO);
			updatedDTO.name = newName;

			// Act
			let modified: UserVersionDTO = await usrRepo.update(updatedDTO),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(cachedDTO.id);

			// Assert
			expect(modified).to.exist;
			expect(modified.id).to.equal(cachedDTO.id);
			expect(modified.name).to.equal(newName);
			expect(modified.version).to.equal(2);
			expect(refetchedDTO).to.be.not.null;
			expect(refetchedDTO.id).to.equal(cachedDTO.id);
			expect(refetchedDTO.name).to.equal(newName);
			expect(refetchedDTO.age).to.equal(cachedDTO.age);
			expect(refetchedDTO.version).to.equal(modified.version);
		});

		it('should return `null` if not found', async () => {
			// Arrange
			let newName = 'Brian',
				updatedDTO: UserVersionDTO = Object.assign(new UserVersionDTO, cachedDTO);
			updatedDTO.id = IMPOSSIBLE_ID;
			updatedDTO.name = newName;

			// Act
			let modified: UserVersionDTO = await usrRepo.update(updatedDTO),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(updatedDTO.id);

			// Assert
			expect(modified).to.be.null;
			// If `update` returns `null`, but we actually find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});
	}); // END describe 'update'

	describe('delete (soft)', () => {
		it('should return a possitive number and the record is still in database', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteSoft(cachedDTO.id),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(cachedDTO.id);

			// Assert
			expect(affectedRows).to.be.greaterThan(0);
			// If `delete` is successful, we must be able to still find that entity with the id.
			expect(refetchedDTO).to.exist;
			expect(refetchedDTO.deletedAt).to.exist;
		});

		it('should return 0 if no affected records', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteSoft(IMPOSSIBLE_ID);

			// Assert
			expect(affectedRows).to.be.equal(0);
		});
	});

	describe('recover', () => {
		it('should return a possitive number if success', async () => {
			// Act
			let affectedRows: number = await usrRepo.recover(cachedDTO.id),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(cachedDTO.id);

			// Assert
			expect(affectedRows).to.be.greaterThan(0);
			expect(refetchedDTO).to.exist;
			expect(refetchedDTO.deletedAt).to.be.null;
		});

		it('should return 0 if no affected records', async () => {
			// Act
			let affectedRows: number = await usrRepo.recover(IMPOSSIBLE_ID);

			// Assert
			expect(affectedRows).to.be.equal(0);
		});

		it('should throw error if there is an active record with same unique keys', async () => {
			// Act
			try {
				let affectedRows: number = await usrRepo.recover(cachedDTO.id);
				expect(affectedRows).not.to.exist;
			} catch (ex) {
				expect(ex).to.be.instanceOf(MinorException);
				expect(ex.message).to.equal('DUPLICATE_UNIQUE_KEY');
			}
		});
	});

	describe('delete (hard)', () => {
		it('should return a possitive number if found', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteHard(cachedDTO.id),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(cachedDTO.id);

			// Assert
			expect(affectedRows).to.be.greaterThan(0);
			// If `delete` is successful, but we still find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});

		it('should return 0 if not found', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteHard(IMPOSSIBLE_ID),
				refetchedDTO: UserVersionDTO = await usrRepo.findByPk(IMPOSSIBLE_ID);

			// Assert
			expect(affectedRows).to.equal(0);
			// If `delete` returns 0, but we actually find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});
	}); // END describe 'delete'

	describe('page', () => {
		it('Should return `null` if there is no records', async () => {
			// Arrange
			const PAGE = 1,
				SIZE = 10;

			// Deletes all from DB
			await usrRepo.deleteAll();

			// Act
			let models: PagedArray<UserVersionDTO> = await usrRepo.page(PAGE, SIZE, {
				includeDeleted: true
			});

			// Assert
			expect(models).to.be.null;
		});

		it('Should return specified number of items if there are more records in database', async () => {
			// Arrange
			const PAGE = 1,
				SIZE = 10,
				TOTAL = SIZE * 2;
			let model: UserVersionDTO;

			// Deletes all from DB
			await usrRepo.deleteAll();

			for (let i = 0; i < TOTAL; i++) {
				model = new UserVersionDTO();
				model.id = idGen.nextBigInt().toString();
				model.name = 'Hiri' + i;
				model.age = Math.ceil(29 * Math.random());
				await usrRepo.create(model);
			}

			// Act
			let models: PagedArray<UserVersionDTO> = await usrRepo.page(PAGE, SIZE);

			// Assert
			expect(models).to.be.not.null;
			expect(models.length).to.be.equal(SIZE);
			expect(models.total).to.be.equal(TOTAL);
		});
	}); // END describe 'page'

	describe('countAll', () => {
		it('Should return a positive number if there are records in database.', async () => {
			// Act
			let count = await usrRepo.countAll();

			// Assert
			expect(count).to.be.greaterThan(0);
		});

		it('Should return 0 if there is no records in database.', async () => {
			// Deletes all from DB
			await usrRepo.deleteAll();

			// Act
			let count = await usrRepo.countAll({ includeDeleted: true });

			// Assert
			expect(count).to.equal(0);
		});
	}); // END describe 'count'

});