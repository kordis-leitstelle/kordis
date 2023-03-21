import { SpectatorService } from '@ngneat/spectator';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { Subject, firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
	let spectator: SpectatorService<AuthService>;
	const mockEventSubject$ = new Subject<OAuthEvent>();

	const createService = createServiceFactory({
		service: AuthService,
		providers: [
			mockProvider(OAuthService, {
				// eslint-disable-next-line rxjs/finnish,rxjs/suffix-subjects
				events: mockEventSubject$,
			}),
		],
	});

	beforeEach(() => (spectator = createService()));

	it('should not be authenticated', () => {
		expect(firstValueFrom(spectator.service.isAuthenticated$)).resolves.toBe(
			false,
		);
	});

	it('should not have claims when unauthorized', () => {
		const mockOauth = spectator.inject(OAuthService);

		jest.spyOn(mockOauth, 'hasValidAccessToken').mockReturnValue(false);

		expect(firstValueFrom(spectator.service.user$)).resolves.toBe(null);
	});

	it('should set claims as user', () => {
		const mockOauth = spectator.inject(OAuthService);

		jest.spyOn(mockOauth, 'getIdentityClaims').mockReturnValue({
			given_name: 'firstname',
			family_name: 'lastname',
			emails: ['testmail', 'irrelevant testmail'],
		});

		jest.spyOn(mockOauth, 'hasValidAccessToken').mockResolvedValueOnce(true); // isAuthenticated$ => true trigger

		mockEventSubject$.next({} as OAuthEvent);

		expect(firstValueFrom(spectator.service.user$)).resolves.toEqual({
			firstName: 'firstname',
			lastName: 'lastname',
			email: 'testmail',
		});
	});
});
