import { createMock } from '@golevelup/ts-jest';
import { CallHandler } from '@nestjs/common/interfaces';
import { Span, trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
import { Observable, firstValueFrom, of } from 'rxjs';

import { KordisRequest } from '@kordis/api/shared';
import { createGqlContextForRequest } from '@kordis/api/test-helpers';
import { AuthUser, Role } from '@kordis/shared/model';

import { SentryOTelUserContextInterceptor } from './sentry-otel-user-context.interceptor';

describe('SentryOTelUserContextInterceptor', () => {
	let interceptor: SentryOTelUserContextInterceptor;

	beforeEach(() => {
		interceptor = new SentryOTelUserContextInterceptor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should set user context and attributes for Sentry and OpenTelemetry', async () => {
		const user: AuthUser = {
			id: '123',
			email: 'test@example.com',
			firstName: 'John',
			lastName: 'Doe',
			role: Role.USER,
			organizationId: '123',
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
			'user.role': user.role,
			'user.organizationId': user.organizationId,
		});

		expect(sentrySetUserSpy).toHaveBeenCalled();
		expect(sentrySetUserSpy).toHaveBeenCalledWith({
			id: user.id,
			email: user.email,
			username: `${user.firstName} ${user.lastName}`,
		});
	});

	it('should ignore user context and attributes for Sentry and OpenTelemetry if no user is present', async () => {
		const ctx = createGqlContextForRequest(
			createMock<KordisRequest>({
				user: undefined,
			}),
		);
		const handler = createMock<CallHandler>({
			handle(): Observable<boolean> {
				return of(true);
			},
		});

		const sentrySetUserSpy = jest.spyOn(Sentry, 'setUser');
		const getActiveSpanSpy = jest.spyOn(trace, 'getActiveSpan');

		await expect(
			firstValueFrom(interceptor.intercept(ctx, handler)),
		).resolves.toBeTruthy();

		expect(sentrySetUserSpy).not.toHaveBeenCalled();
		expect(getActiveSpanSpy).not.toHaveBeenCalled();
	});
});
