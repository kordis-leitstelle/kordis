import { SpectatorService } from '@ngneat/spectator';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { Subject, firstValueFrom } from 'rxjs';

import { OBSERVABILITY_SERVICE, ObservabilityService } from '@kordis/spa/observability';

import { createMock } from '@golevelup/ts-jest';
import { ProdAuthService } from './auth.service';

describe('AuthService', () => {
	let spectator: SpectatorService<ProdAuthService>;
	const mockEventSubject$ = new Subject<OAuthEvent>();

	const createService = createServiceFactory({
		service: ProdAuthService,
		providers: [
			{
				provide: OBSERVABILITY_SERVICE,
				useValue: createMock<ObservabilityService>
			},
			mockProvider(OAuthService, {
				// eslint-disable-next-line rxjs/finnish,rxjs/suffix-subjects
				events: mockEventSubject$,
			}),
		],
	});

	beforeEach(() => (spectator = createService()));

	it('should not be authenticated', async () => {
		await expect(
			firstValueFrom(spectator.service.isAuthenticated$),
		).resolves.toBe(false);
	});

	it('should not have claims when unauthorized', async () => {
		const mockOauth = spectator.inject(OAuthService);

		jest.spyOn(mockOauth, 'hasValidAccessToken').mockReturnValue(false);

		await expect(firstValueFrom(spectator.service.user$)).resolves.toBe(null);
	});

	it('should set claims as user', async () => {
		const mockOauth = spectator.inject(OAuthService);

		jest.spyOn(mockOauth, 'getIdentityClaims').mockReturnValue({
			given_name: 'firstname',
			family_name: 'lastname',
			emails: ['testmail', 'irrelevant testmail'],
		});

		jest.spyOn(mockOauth, 'hasValidAccessToken').mockResolvedValueOnce(true); // isAuthenticated$ => true trigger

		mockEventSubject$.next({} as OAuthEvent);

		await expect(firstValueFrom(spectator.service.user$)).resolves.toEqual({
			firstName: 'firstname',
			lastName: 'lastname',
			email: 'testmail',
		});
	});

	it('should set observability user on user change', async () => {
		const mockOauth = spectator.inject(OAuthService);
		const mockObservabilityService = spectator.inject(OBSERVABILITY_SERVICE);
		const setUserSpy = jest.spyOn(mockObservabilityService, 'setUser');

		jest.spyOn(mockOauth, 'getIdentityClaims').mockReturnValue({
			sub: 'id',
			given_name: 'firstname',
			family_name: 'lastname',
			emails: ['testmail', 'irrelevant testmail'],
		});
		jest.spyOn(mockOauth, 'hasValidAccessToken').mockResolvedValueOnce(true); // isAuthenticated$ => true trigger

		mockEventSubject$.next({} as OAuthEvent);

		expect(setUserSpy).toHaveBeenCalledTimes(1);
		expect(setUserSpy).toHaveBeenCalledWith(
			'id',
			'testmail',
			'firstname lastname',
		);
	});
});
