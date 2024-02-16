import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, firstValueFrom, of } from 'rxjs';

import { KordisRequest } from '@kordis/api/shared';
import {
	createGqlContextForRequest,
	createHttpContextForRequest,
} from '@kordis/api/test-helpers';
import { AuthUser, Role } from '@kordis/shared/model';

import { VerifyAuthUserStrategy } from '../auth-strategies/verify-auth-user.strategy';
import { PresentableUnauthorizedException } from '../errors/presentable-unauthorized.exception';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
	let mockAuthUserExtractor: VerifyAuthUserStrategy;
	let mockReflector: DeepMocked<Reflector>;
	let service: AuthInterceptor;
	beforeEach(() => {
		mockAuthUserExtractor = new (class extends VerifyAuthUserStrategy {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			verifyUserFromRequest(req: KordisRequest): Promise<AuthUser | null> {
				return Promise.resolve(null);
			}
		})();
		mockReflector = createMock<Reflector>();
		service = new AuthInterceptor(mockAuthUserExtractor, mockReflector);
	});

	it('should throw unauthorized http exception', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'verifyUserFromRequest')
			.mockResolvedValueOnce(null);

		await expect(
			firstValueFrom(
				await service.intercept(
					createGqlContextForRequest(createMock<KordisRequest>()),
					createMock<CallHandler>(),
				),
			),
		).rejects.toThrow(PresentableUnauthorizedException);
	});

	it('should throw unauthorized http exception with PresentableUnauthorizedException', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'verifyUserFromRequest')
			.mockResolvedValueOnce({
				id: '123',
				firstName: 'foo',
				lastName: 'bar',
				email: 'foo@bar.de',
				organizationId: '123',
				role: Role.USER,
			});
		mockReflector.get.mockReturnValueOnce(Role.ADMIN);

		await expect(
			firstValueFrom(
				await service.intercept(
					createGqlContextForRequest(createMock<KordisRequest>()),
					createMock<CallHandler>(),
				),
			),
		).rejects.toThrow(PresentableUnauthorizedException);
	});

	it('should continue request pipeline for authenticated request', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'verifyUserFromRequest')
			.mockResolvedValue({
				id: '123',
				firstName: 'foo',
				lastName: 'bar',
				email: 'foo@bar.de',
				organizationId: '123',
				role: Role.USER,
			});
		mockReflector.get.mockReturnValue(undefined);

		const handler = createMock<CallHandler>({
			handle(): Observable<boolean> {
				return of(true);
			},
		});

		const gqlCtx = createGqlContextForRequest(createMock<KordisRequest>());

		await expect(
			firstValueFrom(await service.intercept(gqlCtx, handler)),
		).resolves.toBeTruthy();

		const httpCtx = createHttpContextForRequest(
			createMock<KordisRequest>({
				path: '/graphql',
			}),
		);

		await expect(
			firstValueFrom(await service.intercept(httpCtx, handler)),
		).resolves.toBeTruthy();
	});

	it.each(['/health-check', '/webhooks/foo', '/webhooks/bar'])(
		'should continue request pipeline for %p and webhook request',
		async (path: string) => {
			const handler = createMock<CallHandler>({
				handle(): Observable<boolean> {
					return of(true);
				},
			});

			await expect(
				firstValueFrom(
					await service.intercept(
						createHttpContextForRequest(
							createMock<KordisRequest>({
								path,
							}),
						),
						handler,
					),
				),
			).resolves.toBeTruthy();
		},
	);
});
