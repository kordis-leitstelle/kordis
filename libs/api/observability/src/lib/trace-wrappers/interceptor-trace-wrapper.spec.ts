import { createMock } from '@golevelup/ts-jest';
import type {
	CallHandler,
	ExecutionContext,
	NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { APP_INTERCEPTOR, ModulesContainer } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Observable } from 'rxjs';
import { firstValueFrom, of } from 'rxjs';

import {
	createTraceMocks,
	getComparablePrototypeSnapshot,
} from '@kordis/api/test-helpers';

import { SentryOTelUserContextInterceptor } from '../interceptors/sentry-otel-user-context.interceptor';
import { InterceptorTraceWrapper } from './interceptor-trace-wrapper';

describe('InterceptorTraceWrapper', () => {
	it('should wrap interceptors with spans', async () => {
		const originalImplementationFn = jest.fn();

		@Injectable()
		class TestInterceptor implements NestInterceptor {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			intercept(
				context: ExecutionContext,
				next: CallHandler<any>,
			): Observable<any> {
				originalImplementationFn(context, next);
				return next.handle();
			}
		}

		const moduleRef = await Test.createTestingModule({
			providers: [
				{
					provide: APP_INTERCEPTOR,
					useClass: TestInterceptor,
				},
			],
		}).compile();

		const traceWrapper = new InterceptorTraceWrapper(
			moduleRef.get(ModulesContainer),
		);
		traceWrapper.wrapWithSpans();

		const intercept = TestInterceptor.prototype.intercept;
		const ctx = createMock<ExecutionContext>();
		const handler = createMock<CallHandler>({
			handle: () => of(true),
		});

		const { startSpanSpy, endSpanSpy, spanSetAttributesSpy } =
			createTraceMocks();

		await firstValueFrom(intercept(ctx, handler));

		// validate that original implementation gets called correctly
		expect(originalImplementationFn).toHaveBeenCalledTimes(1);
		expect(originalImplementationFn).toHaveBeenCalledWith(ctx, handler);

		// validate that span gets correctly created
		expect(startSpanSpy).toHaveBeenCalled();
		expect(startSpanSpy).toHaveBeenCalledWith('TestInterceptor (Interceptor)');
		expect(endSpanSpy).toHaveBeenCalled();
		expect(spanSetAttributesSpy).toHaveBeenCalledWith({
			interceptor: 'TestInterceptor',
		});
	});

	it('should ignore SentryOTelUserContextInterceptor', async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				{
					provide: APP_INTERCEPTOR,
					useClass: SentryOTelUserContextInterceptor,
				},
			],
		}).compile();

		const prototypeSnapshot = getComparablePrototypeSnapshot(
			SentryOTelUserContextInterceptor.prototype,
		);

		const traceWrapper = new InterceptorTraceWrapper(
			moduleRef.get(ModulesContainer),
		);
		traceWrapper.wrapWithSpans();

		expect(
			getComparablePrototypeSnapshot(
				SentryOTelUserContextInterceptor.prototype,
			),
		).toBe(prototypeSnapshot);
	});
});
