import { createMock } from '@golevelup/ts-jest';
import { CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable, firstValueFrom, of } from 'rxjs';

import { KordisRequest } from '@kordis/api/shared';
import {
	createGqlContextForRequest,
	createHttpContextForRequest,
} from '@kordis/api/test-helpers';
import { AuthUser } from '@kordis/shared/model';

import { VerifyAuthUserStrategy } from '../auth-strategies/verify-auth-user.strategy';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
	let mockAuthUserExtractor: VerifyAuthUserStrategy;
	let service: AuthInterceptor;

	beforeEach(() => {
		mockAuthUserExtractor = new (class extends VerifyAuthUserStrategy {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			verifyUserFromRequest(req: KordisRequest): Promise<AuthUser | null> {
				return Promise.resolve(null);
			}
		})();
		service = new AuthInterceptor(mockAuthUserExtractor);
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
		).rejects.toThrow(UnauthorizedException);
	});

	it('should continue request pipeline for authenticated request', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'verifyUserFromRequest')
			.mockResolvedValue({
				id: '123',
				firstName: 'foo',
				lastName: 'bar',
				email: 'foo@bar.de',
				organization: 'testorg',
			});

		const handler = createMock<CallHandler>({
			handle(): Observable<boolean> {
				return of(true);
			},
		});

		const gqlCtx = createGqlContextForRequest(createMock<KordisRequest>());

		await expect(
			firstValueFrom(await service.intercept(gqlCtx, handler)),
		).resolves.toBeTruthy();

		const httpCtx = createGqlContextForRequest(createMock<KordisRequest>());

		await expect(
			firstValueFrom(await service.intercept(httpCtx, handler)),
		).resolves.toBeTruthy();
	});

	it('should continue request pipeline for health-check request', async () => {
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
							path: '/health-check',
						}),
					),
					handler,
				),
			),
		).resolves.toBeTruthy();
	});
});
