import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, firstValueFrom, of } from 'rxjs';

import { KordisRequest } from '@kordis/api/shared';
import {
	createGqlContextForRequest,
	createHttpContextForRequest,
} from '@kordis/api/test-helpers';
import { AuthUser, Role } from '@kordis/shared/auth';

import { AuthUserExtractorStrategy } from '../auth-user-extractor-strategies/auth-user-extractor.strategy';
import { PresentableInsufficientPermissionException } from '../errors/presentable-insufficient-permission.exception';
import { PresentableUnauthorizedException } from '../errors/presentable-unauthorized.exception';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
	let mockAuthUserExtractor: AuthUserExtractorStrategy;
	let mockReflector: DeepMocked<Reflector>;
	let service: AuthInterceptor;
	beforeEach(() => {
		mockAuthUserExtractor = new (class extends AuthUserExtractorStrategy {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			getUserFromRequest(req: KordisRequest): AuthUser | null {
				return null;
			}
		})();
		mockReflector = createMock<Reflector>();
		service = new AuthInterceptor(mockAuthUserExtractor, mockReflector);
	});

	it('should throw unauthorized http exception without auth header', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'getUserFromRequest')
			.mockReturnValueOnce(null);

		await expect(
			firstValueFrom(
				service.intercept(
					createGqlContextForRequest(createMock<KordisRequest>()),
					createMock<CallHandler>(),
				),
			),
		).rejects.toThrow(PresentableUnauthorizedException);
	});

	it('should throw unauthorized http exception with insufficient role permission', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'getUserFromRequest')
			.mockReturnValueOnce({
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
				service.intercept(
					createGqlContextForRequest(createMock<KordisRequest>()),
					createMock<CallHandler>(),
				),
			),
		).rejects.toThrow(PresentableInsufficientPermissionException);
	});

	it('should continue request pipeline', async () => {
		jest.spyOn(mockAuthUserExtractor, 'getUserFromRequest').mockReturnValue({
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
			firstValueFrom(service.intercept(gqlCtx, handler)),
		).resolves.toBeTruthy();

		const httpCtx = createHttpContextForRequest(createMock<KordisRequest>());

		await expect(
			firstValueFrom(service.intercept(httpCtx, handler)),
		).resolves.toBeTruthy();
	});
});
