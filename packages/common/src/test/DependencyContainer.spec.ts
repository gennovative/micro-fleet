import { expect } from 'chai';
import { Container } from 'inversify';

import { injectable, inject, IDependencyContainer, DependencyContainer } from '../app';

const NAME = 'gennova',
	IDENTIFIER = Symbol('abc');

interface IDummy {
	getName(): string;
}

@injectable()
class Dummy implements IDummy {
	constructor() {	
	}

	getName(): string {
		return NAME;
	}
}

describe('DependencyContainer', () => {
	describe('bindConstant', () => {
		it('Should return same value everytime', () => {
			// Arrange
			const VALUE = 'abc';
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'];
			
			// Act
			container.bindConstant<string>(IDENTIFIER, VALUE);

			// Assert
			let instance_1st = internalContainer.get<string>(IDENTIFIER),
				instance_2nd = internalContainer.get<string>(IDENTIFIER),
				instance_3rd = internalContainer.get<string>(IDENTIFIER);

			expect(instance_1st).to.be.a('string');
			expect(instance_2nd).to.be.a('string');
			expect(instance_3rd).to.be.a('string');

			expect(instance_1st).to.equal(VALUE);
			expect(instance_1st).to.equal(instance_2nd); // instance_1st === instance_2nd
			expect(instance_1st).to.equal(instance_3rd); // instance_1st === instance_3rd
			expect(instance_2nd).to.equal(instance_3rd); // instance_2nd === instance_3rd
		});
		
		it('Should override previous binding with same identifier', () => {
			// Arrange
			const VALUE_OLD = 'abc',
				VALUE_NEW = 'xyz';
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'];
			
			// Act
			container.bindConstant<string>(IDENTIFIER, VALUE_OLD);
			container.bindConstant<string>(IDENTIFIER, VALUE_NEW);

			// Assert
			let instance_1st = internalContainer.get<string>(IDENTIFIER),
				instance_2nd = internalContainer.get<string>(IDENTIFIER),
				instance_3rd = internalContainer.get<string>(IDENTIFIER);

			expect(instance_1st).to.be.a('string');
			expect(instance_2nd).to.be.a('string');
			expect(instance_3rd).to.be.a('string');

			expect(instance_1st).to.equal(VALUE_NEW);
			expect(instance_1st).to.equal(instance_2nd); // instance_1st === instance_2nd
			expect(instance_1st).to.equal(instance_3rd); // instance_1st === instance_3rd
			expect(instance_2nd).to.equal(instance_3rd); // instance_2nd === instance_3rd
		});
	}); // describe 'bindConstant'

	describe('bind', () => {
		it('Should register dependency to internal container, with string identifier', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'],
				resolveInstance: IDummy;
			
			// Act
			container.bind<IDummy>('abc', Dummy); // String identifier

			// Assert
			resolveInstance = internalContainer.get<IDummy>('abc');
			expect(resolveInstance).to.be.not.null;
			expect(resolveInstance.getName()).to.equal(NAME);
		});
		
		it('Should register dependency to internal container, with symbol identifier', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'],
				resolveInstance: IDummy;
			
			// Act
			container.bind<IDummy>(IDENTIFIER, Dummy); // Symbol identifier

			// Assert
			resolveInstance = internalContainer.get<IDummy>(IDENTIFIER);
			expect(resolveInstance).to.be.not.null;
			expect(resolveInstance.getName()).to.equal(NAME);
		});
		
		it('Should return same instance everytime, when registering as singleton', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'];
			
			// Act
			container.bind<IDummy>(IDENTIFIER, Dummy).asSingleton();

			// Assert
			let instance_1st = internalContainer.get<IDummy>(IDENTIFIER),
				instance_2nd = internalContainer.get<IDummy>(IDENTIFIER),
				instance_3rd = internalContainer.get<IDummy>(IDENTIFIER);

			expect(instance_1st).to.be.not.null;
			expect(instance_2nd).to.be.not.null;
			expect(instance_3rd).to.be.not.null;

			expect(instance_1st).to.equal(instance_2nd); // instance_1st === instance_2nd
			expect(instance_1st).to.equal(instance_3rd); // instance_1st === instance_3rd
			expect(instance_2nd).to.equal(instance_3rd); // instance_2nd === instance_3rd

			expect(instance_1st.getName()).to.equal(NAME);
			expect(instance_2nd.getName()).to.equal(NAME);
			expect(instance_3rd.getName()).to.equal(NAME);
		});
		
		it('Should create new instance everytime, when registering as transient', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'];
			
			// Act
			container.bind<IDummy>(IDENTIFIER, Dummy).asTransient(); // Default behavior

			// Assert
			let instance_1st = internalContainer.get<IDummy>(IDENTIFIER),
				instance_2nd = internalContainer.get<IDummy>(IDENTIFIER),
				instance_3rd = internalContainer.get<IDummy>(IDENTIFIER);

			expect(instance_1st).to.be.not.null;
			expect(instance_2nd).to.be.not.null;
			expect(instance_3rd).to.be.not.null;

			expect(instance_1st).to.not.equal(instance_2nd); // instance_1st !== instance_2nd
			expect(instance_1st).to.not.equal(instance_3rd); // instance_1st !== instance_3rd
			expect(instance_2nd).to.not.equal(instance_3rd); // instance_2nd !== instance_3rd

			expect(instance_1st.getName()).to.equal(NAME);
			expect(instance_2nd.getName()).to.equal(NAME);
			expect(instance_3rd.getName()).to.equal(NAME);
		});
	}); // describe 'bind'
	
	describe('dispose', () => {
		it('Should throw exception if called after disposal', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer();
			container.bind<IDummy>(IDENTIFIER, Dummy);
			
			// Act
			container.dispose();

			// Assert
			let exception = null;
			try {
				container.resolve<IDummy>(IDENTIFIER);
			} catch (ex) {
				exception = ex;
			}
			
			expect(exception).to.be.not.null;
			expect(exception).to.equal('Container has been disposed!');
		});
	}); // describe 'dispose'

	describe('resolve', () => {
		it('Should get dependency from internal container', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'],
				resolveInstance: IDummy;
			
			// Act
			internalContainer.bind<IDummy>(IDENTIFIER).to(Dummy);

			// Assert
			resolveInstance = container.resolve<IDummy>(IDENTIFIER);
			expect(resolveInstance).to.be.not.null;
			expect(resolveInstance.getName()).to.equal(NAME);
		});
		
		it('Should return null if no dependency is found', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				resolveInstance: IDummy;
			
			// Act
			resolveInstance = container.resolve<IDummy>(IDENTIFIER);

			// Assert
			expect(resolveInstance).to.be.null;
		});
	}); // describe 'resolve'
	
	describe('isBound', () => {
		it('Should check if a dependency is bound or not.', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'];
			
			// Act
			internalContainer.bind<IDummy>(IDENTIFIER).to(Dummy);
			// Assert
			expect(container.isBound(IDENTIFIER)).to.be.true;

			// Act
			internalContainer.unbind(IDENTIFIER);
			// Assert
			expect(container.isBound(IDENTIFIER)).to.be.false;
		});
	}); // describe 'isBound'
	
	describe('unbind', () => {
		it('Should not resolve unbound dependency anymore.', () => {
			// Arrange
			let container: IDependencyContainer = new DependencyContainer(),
				internalContainer: Container = container['_container'];
			
			internalContainer.bind<IDummy>(IDENTIFIER).to(Dummy);
			expect(internalContainer.isBound(IDENTIFIER)).to.be.true;

			// Act
			container.unbind(IDENTIFIER);

			// Assert
			let resolved;
			try {
				resolved = internalContainer.get<IDummy>(IDENTIFIER);
				expect(resolved).not.to.exist;
			} catch (err) {
				expect(err.message).to.contain('No matching bindings');
			}
			expect(internalContainer.isBound(IDENTIFIER)).to.be.false;
		});
	}); // describe 'isBound'
});