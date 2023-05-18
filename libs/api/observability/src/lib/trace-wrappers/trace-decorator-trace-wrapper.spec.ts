import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { createTraceMocks } from '@kordis/api/test-helpers';

import { Trace } from '../decorators/trace.decorator';
import { TraceDecoratorTraceWrapper } from './trace-decorator-trace-wrapper';

describe('Trace Decorator', () => {
	it('should only wrap queries and mutations with spans', async () => {
		@Injectable()
		class TestProvider {
			@Trace()
			traceMe() {
				return 'original traceMe implementation';
			}

			@Trace('traceName')
			traceMeWithName() {
				return 'original traceMeWithName implementation';
			}
		}

		const moduleRef = await Test.createTestingModule({
			providers: [TestProvider],
		}).compile();
		const traceWrapper = new TraceDecoratorTraceWrapper(
			moduleRef.get(ModulesContainer),
		);

		const { startSpanSpy, endSpanSpy, spanSetAttributesSpy } =
			createTraceMocks();

		traceWrapper.wrapWithSpans();

		expect(TestProvider.prototype.traceMe()).toBe(
			'original traceMe implementation',
		);
		expect(TestProvider.prototype.traceMeWithName()).toBe(
			'original traceMeWithName implementation',
		);

		expect(startSpanSpy).toHaveBeenCalledTimes(2);
		expect(startSpanSpy.mock.calls).toEqual([
			['TestProvider (Provider) -> traceMe'],
			['TestProvider (Provider) -> traceMeWithName (traceName)'],
		]);
		expect(endSpanSpy).toHaveBeenCalledTimes(2);
		expect(spanSetAttributesSpy.mock.calls).toEqual([
			[
				{
					provider: 'TestProvider',
					method: 'traceMe',
				},
			],
			[
				{
					provider: 'TestProvider',
					method: 'traceMeWithName',
					traceName: 'traceName',
				},
			],
		]);
	});
});
