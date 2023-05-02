import { ModulesContainer } from '@nestjs/core';

import { createTraceMocks } from '@kordis/api/test-helpers';

import { TraceWrapper } from './abstract-trace-wrapper';

// event though the trace wrapper is abstract, we want to ensure that the methods gets wrapped correctly,
// so we don't have to validate everything in the concrete implementations.
describe('TraceWrapper', () => {
	class TestableTraceWrapper extends TraceWrapper {
		constructor(modulesContainer: ModulesContainer) {
			super(modulesContainer);
		}

		wrapWithSpans(): void {}

		public proxyAsWrapped(
			prototype: Record<any, any>,
			traceName: string,
			attributes = {},
		): any {
			return this.asWrapped(prototype, traceName, attributes);
		}
	}

	let traceWrapper: TestableTraceWrapper;
	let modulesContainer: ModulesContainer;

	beforeEach(() => {
		modulesContainer = new ModulesContainer();
		traceWrapper = new TestableTraceWrapper(modulesContainer);
	});

	afterEach(() => jest.clearAllMocks());

	it('should start and end a span for the original method', () => {
		class TestClass {
			originalMethod() {}
		}

		TestClass.prototype.originalMethod = traceWrapper.proxyAsWrapped(
			TestClass.prototype.originalMethod,
			'traceName',
		);

		const { startSpanSpy, endSpanSpy } = createTraceMocks();

		TestClass.prototype.originalMethod();

		expect(startSpanSpy).toHaveBeenCalledTimes(1);
		expect(endSpanSpy).toHaveBeenCalledTimes(1);
	});

	it('should redecorate wrapped methods with their metadata', () => {
		class TestClass {
			@Reflect.metadata('key', 'value')
			originalMethod() {}
		}

		TestClass.prototype.originalMethod = traceWrapper.proxyAsWrapped(
			TestClass.prototype.originalMethod,
			'traceName',
		);

		expect(
			Reflect.getMetadata('key', TestClass.prototype, 'originalMethod'),
		).toBe('value');
	});

	it('should call the original method', async () => {
		class TestClass {
			async asyncMethod() {
				return 'async';
			}

			syncMethod() {
				return 'sync';
			}
		}

		TestClass.prototype.asyncMethod = traceWrapper.proxyAsWrapped(
			TestClass.prototype.asyncMethod,
			'traceName',
		);

		TestClass.prototype.syncMethod = traceWrapper.proxyAsWrapped(
			TestClass.prototype.syncMethod,
			'traceName',
		);

		await expect(TestClass.prototype.asyncMethod()).resolves.toBe('async');
		expect(TestClass.prototype.syncMethod()).toBe('sync');
	});

	it('should handle and end span on throwing methods', async () => {
		class TestClass {
			async asyncMethod() {
				throw new Error();
			}

			syncMethod() {
				throw new Error();
			}
		}

		const { endSpanSpy } = createTraceMocks();

		TestClass.prototype.asyncMethod = traceWrapper.proxyAsWrapped(
			TestClass.prototype.asyncMethod,
			'traceName',
		);

		TestClass.prototype.syncMethod = traceWrapper.proxyAsWrapped(
			TestClass.prototype.syncMethod,
			'traceName',
		);

		await expect(TestClass.prototype.asyncMethod()).rejects.toThrow();
		expect(TestClass.prototype.syncMethod).toThrow();
		expect(endSpanSpy).toHaveBeenCalledTimes(2);
	});
});
