import { createMock } from '@golevelup/ts-jest';
import type { CallHandler } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { firstValueFrom, of } from 'rxjs';

import type { KordisRequest } from '@kordis/api/shared';
import { createGqlContextForRequest } from '@kordis/api/test-helpers';
import type { AuthUser } from '@kordis/shared/auth';

import { AuthUserExtractorStrategy } from '../auth-user-extractor-strategies/auth-user-extractor.strategy';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
	let mockAuthUserExtractor: AuthUserExtractorStrategy;
	let service: AuthInterceptor;

	beforeEach(() => {
		mockAuthUserExtractor = new (class extends AuthUserExtractorStrategy {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			getUserFromRequest(req: KordisRequest): AuthUser | null {
				return null;
			}
		})();
		service = new AuthInterceptor(mockAuthUserExtractor);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should throw unauthorized http exception', async () => {
		jest
			.spyOn(mockAuthUserExtractor, 'getUserFromRequest')
			.mockReturnValue(null);

		await expect(
			firstValueFrom(
				service.intercept(
					createGqlContextForRequest(createMock<KordisRequest>()),
					createMock<CallHandler>(),
				),
			),
		).rejects.toThrow(UnauthorizedException);
	});

	it('should continue request pipeline', async () => {
		jest.spyOn(mockAuthUserExtractor, 'getUserFromRequest').mockReturnValue({
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
			firstValueFrom(service.intercept(gqlCtx, handler)),
		).resolves.toBeTruthy();

		const httpCtx = createGqlContextForRequest(createMock<KordisRequest>());

		await expect(
			firstValueFrom(service.intercept(httpCtx, handler)),
		).resolves.toBeTruthy();
	});
});
