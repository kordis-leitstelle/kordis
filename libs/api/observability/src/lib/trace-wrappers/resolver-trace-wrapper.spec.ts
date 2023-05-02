import { ModulesContainer } from '@nestjs/core';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import {
	createTraceMocks,
	getComparablePrototypeSnapshot,
} from '@kordis/api/test-helpers';

import { ResolverTraceWrapper } from './resolver-trace-wrapper';

describe('ResolverTraceWrapper', () => {
	it('should only wrap queries and mutations with spans', async () => {
		@Resolver()
		class TestResolver {
			@Query()
			someQuery() {
				return 'original someQuery implementation';
			}

			@Mutation()
			someMutation() {
				return 'original someMutation implementation';
			}

			notOfInterest() {}
		}

		const moduleRef = await Test.createTestingModule({
			providers: [TestResolver],
		}).compile();
		const traceWrapper = new ResolverTraceWrapper(
			moduleRef.get(ModulesContainer),
		);

		const { startSpanSpy, endSpanSpy, spanSetAttributesSpy } =
			createTraceMocks();
		const notOfInterestPrototypeSnapshot = getComparablePrototypeSnapshot(
			TestResolver.prototype.notOfInterest,
		);

		traceWrapper.wrapWithSpans();

		expect(TestResolver.prototype.someQuery()).toBe(
			'original someQuery implementation',
		);
		expect(TestResolver.prototype.someMutation()).toBe(
			'original someMutation implementation',
		);

		// validate that span gets correctly created
		expect(startSpanSpy).toHaveBeenCalledTimes(2);
		const x = startSpanSpy.mock.calls[0];
		expect(startSpanSpy.mock.calls).toEqual([
			['TestResolver (Resolver) -> someQuery (Query)'],
			['TestResolver (Resolver) -> someMutation (Mutation)'],
		]);
		expect(endSpanSpy).toHaveBeenCalledTimes(2);
		expect(spanSetAttributesSpy.mock.calls).toEqual([
			[
				{
					resolver: 'TestResolver',
					method: 'someQuery',
				},
			],
			[
				{
					resolver: 'TestResolver',
					method: 'someMutation',
				},
			],
		]);

		expect(
			getComparablePrototypeSnapshot(TestResolver.prototype.notOfInterest),
		).toBe(notOfInterestPrototypeSnapshot);
	});
});
