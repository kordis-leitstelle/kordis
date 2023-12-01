import { createMock } from '@golevelup/ts-jest';
import type { CallHandler } from '@nestjs/common/interfaces';
import type { Span } from '@opentelemetry/api';
import { trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
import type { Observable } from 'rxjs';
import { firstValueFrom, of } from 'rxjs';

import type { KordisRequest } from '@kordis/api/shared';
import { createGqlContextForRequest } from '@kordis/api/test-helpers';
import type { AuthUser } from '@kordis/shared/auth';

import { SentryOTelUserContextInterceptor } from './sentry-otel-user-context.interceptor';

describe('SentryOTelUserContextInterceptor', () => {
	let interceptor: SentryOTelUserContextInterceptor;

	beforeEach(() => {
		interceptor = new SentryOTelUserContextInterceptor();
	});

	it('should be defined', () => {
		expect(interceptor).toBeDefined();
	});

	it('should set user context and attributes for Sentry and OpenTelemetry', async () => {
		const user: AuthUser = {
			id: '123',
			email: 'test@example.com',
			firstName: 'John',
			lastName: 'Doe',
			organization: 'testorg',
		};

		const ctx = createGqlContextForRequest(
			createMock<KordisRequest>({
				user,
			}),
		);
		const handler = createMock<CallHandler>({
			handle(): Observable<boolean> {
				return of(true);
			},
		});

		const getActiveSpanSpy = jest.spyOn(trace, 'getActiveSpan');
		getActiveSpanSpy.mockReturnValue(createMock<Span>());

		const sentrySetUserSpy = jest.spyOn(Sentry, 'setUser');

		await expect(
			firstValueFrom(interceptor.intercept(ctx, handler)),
		).resolves.toBeTruthy();

		expect(getActiveSpanSpy).toHaveBeenCalled();
		expect(
			getActiveSpanSpy.mock.results[0].value.setAttributes,
		).toHaveBeenCalledWith({
			'user.id': user.id,
			'user.email': user.email,
			'user.name': `${user.firstName} ${user.lastName}`,
		});

		expect(sentrySetUserSpy).toHaveBeenCalled();
		expect(sentrySetUserSpy).toHaveBeenCalledWith({
			id: user.id,
			email: user.email,
			username: `${user.firstName} ${user.lastName}`,
		});
	});
});
