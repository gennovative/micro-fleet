import * as chai from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'inversify';

import { injectable, inject, IDependencyContainer, DependencyContainer,
	HandlerContainer, CriticalException } from '../app';

chai.use(spies);
const expect = chai.expect;


const NAME = 'gennova',
	AGE = 18,
	IDENTIFIER = Symbol('abc');

interface IDummy {
	echoName(name): string;
	doubleName(name): string;
	echoAge(age): number;
}

@injectable()
class Dummy implements IDummy {
	constructor() {	
	}

	public echoName(name): string {
		return name;
	}
	
	public doubleName(name): string {
		return name + name;
	}

	public echoAge(age): number {
		return age;
	}
}

describe('HandlerContainer', () => {
	let container: IDependencyContainer;

	beforeEach(() => {
		container = new DependencyContainer();
		HandlerContainer.instance.dependencyContainer = container;
		container.bind<IDummy>(IDENTIFIER, Dummy).asSingleton();
	});

	afterEach(() => {
		HandlerContainer.instance.clear();
		container.dispose();
		container = null;
	});

	describe('register', () => {
		it('Should handle one action', () => {
			// Arrage
			let dummy = container.resolve<IDummy>(IDENTIFIER),
				echoSpy = chai.spy.on(dummy, 'echoName');

			// Act
			let proxyFn = HandlerContainer.instance.register('echoName', IDENTIFIER);

			// Assert
			let result = proxyFn(NAME);
			expect(result).to.equal(NAME);
			expect(echoSpy).to.be.called.once;
		});

		it('Should handle multiple actions', () => {
			// Arrage
			let dummy = container.resolve<IDummy>(IDENTIFIER),
				nameSpy = chai.spy.on(dummy, 'echoName'),
				ageSpy = chai.spy.on(dummy, 'echoAge');

			// Act
			let [proxyNameFn, proxyAgeFn] = HandlerContainer.instance.register(['echoName', 'echoAge'], IDENTIFIER);

			// Assert
			let name = proxyNameFn(NAME),
				age = proxyAgeFn(AGE);
			expect(name).to.equal(NAME);
			expect(age).to.equal(AGE);
			expect(nameSpy).to.be.called.once;
			expect(ageSpy).to.be.called.once;
		});
	}); // END describe 'register'

	describe('resolve', () => {
		it('Should look up a registered action', () => {
			// Arrage
			HandlerContainer.instance.register('echoName', IDENTIFIER);

			// Act
			let func = HandlerContainer.instance.resolve('echoName');

			// Assert
			let result = func(NAME);
			expect(result).to.equal(NAME);
		});

		it('Should produce a handler with factory', () => {
			// Arrage
			HandlerContainer.instance.register('callMyName', IDENTIFIER, 
				obj => obj.doubleName);

			// Act
			let func = HandlerContainer.instance.resolve('callMyName');

			// Assert
			let result = func(NAME);
			expect(result).to.equal(NAME + NAME);
		});

		it('Should throw exception if attempting to resolve an unregistered action', () => {
			// Act
			try {
				let func: Function = HandlerContainer.instance.resolve('echoName');
				expect(func).not.to.exist;
			} catch (err) {
				console.error(err);
				expect(err).to.exist;
				expect(err).to.be.instanceOf(CriticalException);
				expect(err.message).to.contain('was not registered');
			}
		});

		it('Should throw exception if resolved function does not exist', () => {
			// Arrage
			HandlerContainer.instance.register('nonexistFunc', IDENTIFIER);

			// Act
			try {
				let func: Function = HandlerContainer.instance.resolve('nonexistFunc');
				expect(func).not.to.exist;
			} catch (err) {
				console.error(err);
				expect(err).to.exist;
				expect(err).to.be.instanceOf(CriticalException);
				expect(err.message).to.contain('does not exist');
			}
		});
	}); // END describe 'register'
});