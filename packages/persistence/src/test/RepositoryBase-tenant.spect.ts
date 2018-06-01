import { expect } from 'chai';

import { InvalidArgumentException, MinorException } from '@micro-fleet/common-util';
import { PagedArray, ModelAutoMapper, constants } from '@micro-fleet/common-contracts';
import { IdGenerator } from '@micro-fleet/id-generator';

import { EntityBase, QueryCallback, IDatabaseConnector,
	KnexDatabaseConnector, AtomicSessionFactory, AtomicSessionFlow, AtomicSession,
	RepositoryBase } from '../app';
import DB_DETAILS from './database-details';

const { DbClient } = constants;


const DB_TABLE = 'usersTenant',
	IMPOSSIBLE_ID = '0';


// Should put this in Types.ts
const TYPE_USER_DTO = Symbol('UserDTO'),
	TYPE_USER_ENT = Symbol('UserEntity');

class UserTenantDTO implements IModelDTO, ISoftDeletable {

	public static translator: ModelAutoMapper<UserTenantDTO> = new ModelAutoMapper(UserTenantDTO);

	// NOTE: Class properties must be initialized, otherwise they
	// will disappear in transpiled code.
	public id: BigInt = undefined;
	public tenantId: BigInt = undefined;
	public name: string = undefined;
	public age: number = undefined;
	public deletedAt: Date = undefined;
}


class UserTenantEntity extends EntityBase {
	/**
	 * @override
	 */
	public static get tableName(): string {
		return DB_TABLE;
	}

	public static readonly idColumn = ['id', 'tenant_id'];
	public static readonly idProp = ['id', 'tenantId'];
	public static readonly uniqColumn = ['name'];

	public static translator: ModelAutoMapper<UserTenantEntity> = new ModelAutoMapper(UserTenantEntity);

	// NOTE: Class properties must be initialized, otherwise they
	// will disappear in transpiled code.
	public id: BigInt = undefined;
	public tenantId: BigInt = undefined;
	public name: string = undefined;
	public age: number = undefined;
	public deletedAt: string = undefined;
}

class UserTenantRepo extends RepositoryBase<UserTenantEntity, UserTenantDTO, TenantPk> {
	
	private _sessionFactory: AtomicSessionFactory;

	constructor(
		dbConnector: IDatabaseConnector
	) {
		super(UserTenantEntity, dbConnector, {
			isMultiTenancy: true
		});
		this._sessionFactory = new AtomicSessionFactory(dbConnector);
	}

	public createCoupleWithTransaction(adam: UserTenantDTO, eva: UserTenantDTO): Promise<UserTenantDTO[]> {
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
	public failOnSecondTransaction(adam: UserTenantDTO, eva: UserTenantDTO): Promise<UserTenantDTO[]> {
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

	public createAdamOnSecondConn(adam: UserTenantDTO): Promise<UserTenantDTO> {
		return this._sessionFactory.startSession('sec')
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.closePipe();
	}

	public createAdamOnNonExistConn(adam: UserTenantDTO): Promise<UserTenantDTO> {
		return this._sessionFactory.startSession('nonexist')
			.pipe(atomicSession => this.create(adam, { atomicSession }))
			.closePipe();
	}

	public createSessionPipe(adam: UserTenantDTO, eva: UserTenantDTO): AtomicSessionFlow {
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

	public createEmptyPipe(adam: UserTenantDTO, eva: UserTenantDTO): AtomicSessionFlow {
		return this._sessionFactory.startSession()
			.pipe(session => {
				return Promise.resolve('Nothing');
			});
			//.closePipe(); // Not closing pipe
	}

	public async findOnFirstConn(pk: TenantPk): Promise<UserTenantDTO> {
		let foundEnt: UserTenantEntity = await this._processor.executeQuery(query => {
			return query.findById(this._processor.toArr(pk, UserTenantEntity.idProp));
			}, null, '0'); // Executing on first connection only.

		return this._processor.toDTO(foundEnt, false);
	}

	public async findOnSecondConn(pk: TenantPk): Promise<UserTenantDTO> {
		let foundEnt: UserTenantEntity = await this._processor.executeQuery(query => {
			return query.findById(this._processor.toArr(pk, UserTenantEntity.idProp));
			}, null, 'sec'); // Executing on second connection (named 'sec').

		return this._processor.toDTO(foundEnt, false);
	}

	public async deleteOnSecondConn(pk: TenantPk): Promise<UserTenantDTO> {
		let affectedRows = await this._processor.executeQuery(query => {
			return query.deleteById(this._processor.toArr(pk, UserTenantEntity.idProp));
			}, null, 'sec');
		return affectedRows;
	}

	public deleteAll(): Promise<void> {
		return this._processor.executeQuery(query => query.delete());
	}
}

let cachedDTO: UserTenantDTO,
	dbConnector: IDatabaseConnector,
	usrRepo: UserTenantRepo,
	idGen = new IdGenerator();


// These test suites make real changes to database.
describe('RepositoryBase-tenant', function() {
	// Uncomment for debugging
	// this.timeout(50000);
	
	beforeEach('Initialize db adapter', () => {
		dbConnector = new KnexDatabaseConnector();
		// // For SQLite3 file
		// dbConnector.addConnection({
			// clientName: DbClient.SQLITE3,
			// filePath: CONN_FILE,
		// });

		// // For PostgreSQL
		dbConnector.init(DB_DETAILS);
		usrRepo = new UserTenantRepo(dbConnector);
	});

	afterEach('Tear down db adapter', async () => {
		await dbConnector.dispose();
		dbConnector = null;
	});

	describe('create with transaction', function () {

		it('should insert two rows on each database', async () => {
			// Arrange
			let modelOne = new UserTenantDTO(),
				modelTwo = new UserTenantDTO();

			modelOne.id = idGen.nextBigInt().toString();
			modelOne.tenantId = idGen.nextBigInt().toString();
			modelOne.name = 'One';
			modelOne.age = 11;

			modelTwo.id = idGen.wrapBigInt(modelOne.id).toString(); // Basically same with `modelTwo.id = modelOne.id`
			modelTwo.tenantId = idGen.nextBigInt().toString();
			modelTwo.name = 'Two';
			modelTwo.age = 22;

			try {
				// Act
				let output = await usrRepo.createCoupleWithTransaction(modelOne, modelTwo);
				expect(output).to.exist;

				let [createdOne, createdTwo] = output;
				// Assert
				expect(createdOne).to.exist;
				expect(createdTwo).to.exist;
				expect(createdOne.id).to.be.equal(modelOne.id);
				expect(createdTwo.id).to.be.equal(modelTwo.id);
				expect(createdOne.name).to.equal(modelOne.name);
				expect(createdOne.age).to.equal(modelOne.age);
				expect(createdTwo.name).to.equal(modelTwo.name);
				expect(createdTwo.age).to.equal(modelTwo.age);

				// Clean up
				await Promise.all([
					usrRepo.deleteHard({
						id: createdOne.id,
						tenantId: createdOne.id
					}),
					usrRepo.deleteHard({
						id: createdTwo.id,
						tenantId: createdTwo.id
					})
				]);
			} catch (err) {
				console.error(err);
				expect(err).not.to.exist;
			}
		});

		it('should rollback all transactions when a query fails either on one or all transactions', async () => {
			// Arrange
			try {
				await usrRepo.deleteAll();
			} catch (ex) {
			}

			let modelOne = new UserTenantDTO(),
				modelTwo = new UserTenantDTO();

			modelOne.id = modelTwo.id = idGen.nextBigInt().toString();
			modelOne.tenantId = idGen.nextBigInt().toString();
			modelOne.name = 'One';
			modelOne.age = 11;

			modelTwo.tenantId = idGen.nextBigInt().toString();
			modelTwo.name = null; // fail
			modelTwo.age = 22;

			try {
				// Act
				let output = await usrRepo.createCoupleWithTransaction(modelOne, modelTwo);
				expect(output).not.to.exist;
			} catch (error) {
				// Assert
				expect(error).to.exist;
				expect(error.message).to.include('not-null');
			}
			// Assert
			let count = await usrRepo.countAll({
				tenantId: modelOne.tenantId
			});
			expect(count).to.equal(0);

			count = await usrRepo.countAll({
				tenantId: modelTwo.tenantId
			});
			expect(count).to.equal(0);
		});

		it('should resolve same result if calling `closePipe` multiple times', async () => {
			// Arrange
			let modelOne = new UserTenantDTO(),
				modelTwo = new UserTenantDTO();

			modelOne.id = modelTwo.id = idGen.nextBigInt().toString();
			modelOne.tenantId = idGen.nextBigInt().toString();
			modelOne.name = 'One';
			modelOne.age = 11;

			modelTwo.tenantId = idGen.nextBigInt().toString();
			modelTwo.name = 'Two';
			modelTwo.age = 22;

			try {
				// Act
				let flow = usrRepo.createSessionPipe(modelOne, modelTwo),
					outputOne = await flow.closePipe(),
					outputTwo = await flow.closePipe();

				// Assert
				expect(outputOne).to.exist;
				expect(outputTwo).to.exist;
				expect(outputOne[0]).to.equal(outputTwo[0]);
				expect(outputOne[1]).to.equal(outputTwo[1]);

				// Clean up
				await Promise.all([
					usrRepo.deleteHard({
						id: outputOne[0].id,
						tenantId: outputOne[0].tenantId,
					}),
					usrRepo.deleteHard({
						id: outputOne[1].id,
						tenantId: outputOne[1].tenantId,
					})
				]);
			} catch (err) {
				console.error(err);
				expect(err).not.to.exist;
			}
		});

		it('should throw error if calling `pipe` after `closePipe`', () => {
			// Arrange
			let modelOne = new UserTenantDTO(),
				modelTwo = new UserTenantDTO();

			modelOne.id = modelTwo.id = idGen.nextBigInt().toString();
			modelOne.tenantId = idGen.nextBigInt().toString();
			modelOne.name = 'One';
			modelOne.age = 11;

			modelTwo.tenantId = idGen.nextBigInt().toString();
			modelTwo.name = 'Two';
			modelTwo.age = 22;

			try {
				// Act
				let flow = usrRepo.createEmptyPipe(modelOne, modelTwo);

				flow.closePipe();
				flow.pipe(s => {
					expect(null, 'Should not go here!').to.exist;
					return Promise.reject(null);
				});
			} catch (err) {
				// Assert
				expect(err).to.exist;
				expect(err).to.be.instanceOf(MinorException);
				expect(err.message).to.equal('Pipe has been closed!');
			}
		});
	});

	describe('create without transaction', () => {
		it('should insert a row to database without transaction', async () => {
			// Arrange
			let model = new UserTenantDTO(),
				tenantId = idGen.nextBigInt().toString();
			model.id = idGen.nextBigInt().toString();
			model.tenantId = tenantId;
			model.name = 'Hiri';
			model.age = 29;

			// Act
			let createdDTO: UserTenantDTO = cachedDTO = await usrRepo.create(model);

			// Assert
			expect(createdDTO).to.be.not.null;
			expect(createdDTO.id).to.equal(model.id);
			expect(createdDTO.name).to.equal(model.name);
			expect(createdDTO.age).to.equal(model.age);
		});
	}); // END describe 'create'

	describe('find', () => {
		it('should return an model instance if found', async () => {
			// Act
			let foundDTO: UserTenantDTO = await usrRepo.findByPk({
				id: cachedDTO.id,
				tenantId: cachedDTO.tenantId
			});

			// Assert
			expect(foundDTO).to.be.not.null;
			expect(foundDTO.id).to.equal(cachedDTO.id);
			expect(foundDTO.name).to.equal(cachedDTO.name);
			expect(foundDTO.age).to.equal(cachedDTO.age);
		});

		it('should return `null` if not found', async () => {
			// Act
			let model: UserTenantDTO = await usrRepo.findByPk({
				id: IMPOSSIBLE_ID,
				tenantId: '0'
			});

			// Assert
			expect(model).to.be.null;
		});
	}); // END describe 'find'

	describe('patch', () => {
		it('should return an object with updated properties if found', async () => {
			// Arrange
			let newAge = 45;

			// Act
			let partial: Partial<UserTenantDTO> = await usrRepo.patch({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId,
					age: newAge
				}),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				});

			// Assert
			expect(partial.id).to.equal(cachedDTO.id);
			expect(partial.age).to.equal(newAge);
			expect(refetchedDTO).to.be.not.null;
			expect(refetchedDTO.id).to.equal(cachedDTO.id);
			expect(refetchedDTO.name).to.equal(cachedDTO.name);
			expect(refetchedDTO.age).to.equal(newAge);
		});

		it('should return `null` if not found', async () => {
			// Arrange
			let newAge = 45;

			// Act
			let partial: Partial<UserTenantDTO> = await usrRepo.patch({
					id: IMPOSSIBLE_ID,
					tenantId: '0',
					age: newAge
				}),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: IMPOSSIBLE_ID,
					tenantId: '0'
				});
			
			// Assert
			expect(partial).to.be.null;
			// If `patch` returns `null`, but we actually find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});
	}); // END describe 'patch'

	describe('update', () => {
		it('should return an updated model if found', async () => {
			// Arrange
			let newName = 'Brian',
				updatedDTO: UserTenantDTO = Object.assign(new UserTenantDTO, cachedDTO);
			updatedDTO.name = newName;

			// Act
			let modified: UserTenantDTO = await usrRepo.update(updatedDTO),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				});

			// Assert
			expect(modified).to.exist;
			expect(modified.id).to.equal(cachedDTO.id);
			expect(modified.name).to.equal(newName);
			expect(refetchedDTO).to.be.not.null;
			expect(refetchedDTO.id).to.equal(cachedDTO.id);
			expect(refetchedDTO.name).to.equal(newName);
			expect(refetchedDTO.age).to.equal(cachedDTO.age);
		});

		it('should return `null` if not found', async () => {
			// Arrange
			let newName = 'Brian',
				updatedDTO: UserTenantDTO = Object.assign(new UserTenantDTO, cachedDTO);
			updatedDTO.id = IMPOSSIBLE_ID;
			updatedDTO.name = newName;

			// Act
			let modified: UserTenantDTO = await usrRepo.update(updatedDTO),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: updatedDTO.id,
					tenantId: updatedDTO.tenantId
				});

			// Assert
			expect(modified).to.be.null;
			// If `update` returns `null`, but we actually find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});
	}); // END describe 'update'

	describe('delete (soft)', () => {
		it('should return a possitive number and the record is still in database', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteSoft({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				}),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				});

			// Assert
			expect(affectedRows).to.equal(1);
			// If `delete` is successful, we must be able to still find that entity with the id.
			expect(refetchedDTO).to.exist;
			expect(refetchedDTO.deletedAt).to.exist;
		});

		it('should return number of affected rows', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteSoft([{
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				}, {
					id: cachedDTO.id,
					tenantId: IMPOSSIBLE_ID
				}]),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				});

			// Assert
			expect(affectedRows).to.equal(1);
			// If `delete` is successful, we must be able to still find that entity with the id.
			expect(refetchedDTO).to.exist;
			expect(refetchedDTO.deletedAt).to.exist;
		});
	}); // END describe 'delete (soft)'

	describe('recover', () => {
		it('should return a possitive number if success', async () => {
			// Act
			let affectedRows: number = await usrRepo.recover({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				}),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				});

			// Assert
			expect(affectedRows).to.be.greaterThan(0);
			// If `delete` is successful, we must be able to still find that entity with the id.
			expect(refetchedDTO).to.exist;
			expect(refetchedDTO.deletedAt).to.be.null;
		});
		
		it('should return 0 if no affected records', async () => {
			// Act
			let affectedRows: number = await usrRepo.recover({
				id: cachedDTO.id,
				tenantId: IMPOSSIBLE_ID
			});

			// Assert
			expect(affectedRows).to.be.equal(0);
		});
	}); // END describe 'recover'

	describe('delete (hard)', () => {
		it('should return a possitive number if found', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteHard({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				}),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: cachedDTO.id,
					tenantId: cachedDTO.tenantId
				});

			// Assert
			expect(affectedRows).to.be.greaterThan(0);
			// If `delete` is successful, but we still find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});

		it('should return 0 if not found', async () => {
			// Act
			let affectedRows: number = await usrRepo.deleteHard({
					id: IMPOSSIBLE_ID,
					tenantId: '0'
				}),
				refetchedDTO: UserTenantDTO = await usrRepo.findByPk({
					id: IMPOSSIBLE_ID,
					tenantId: '0'
				});

			// Assert
			expect(affectedRows).to.equal(0);
			// If `delete` returns 0, but we actually find an entity with the id, then something is wrong.
			expect(refetchedDTO).to.be.null;
		});
	}); // END describe 'delete (hard)'
	
	describe('page', () => {
		it('Should return `null` if there is no records', async () => {
			// Arrange
			const PAGE = 1,
				SIZE = 10;

			// Deletes all from DB
			await usrRepo.deleteAll();

			// Act
			let models: PagedArray<UserTenantDTO> = await usrRepo.page(PAGE, SIZE, {
				tenantId: '0'
			});

			// Assert
			expect(models).to.be.null;
		});

		it('Should return specified number of items if there are more records in database', async () => {
			// Arrange
			const PAGE = 1,
				SIZE = 10,
				TOTAL = SIZE * 2;
			let model: UserTenantDTO,
				tenantId = idGen.nextBigInt().toString();

			// Deletes all from DB
			await usrRepo.deleteAll();

			for (let i = 0; i < TOTAL; i++) {
				model = new UserTenantDTO();
				model.id = idGen.nextBigInt().toString();
				model.tenantId = tenantId;
				model.name = 'Hiri' + i;
				model.age = Math.ceil(29 * Math.random());
				cachedDTO = await usrRepo.create(model);
			}

			// Act
			let models: PagedArray<UserTenantDTO> = await usrRepo.page(PAGE, SIZE, {
				tenantId: tenantId
			});

			// Assert
			expect(models).to.be.not.null;
			expect(models.length).to.be.equal(SIZE);
			expect(models.total).to.be.equal(TOTAL);
		});
	}); // END describe 'page'

	describe('countAll', () => {
		it('Should return a positive number if there are records in database.', async () => {
			// Act
			let count = await usrRepo.countAll({
				tenantId: cachedDTO.tenantId
			});

			// Assert
			expect(count).to.be.greaterThan(0);
		});

		it('Should return 0 if there is no records in database.', async () => {
			// Deletes all from DB
			await usrRepo.deleteAll();

			// Act
			let count = await usrRepo.countAll({
				tenantId: cachedDTO.tenantId
			});

			// Assert
			expect(count).to.equal(0);
		});
	}); // END describe 'count'

});