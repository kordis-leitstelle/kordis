import { SpectatorService } from '@ngneat/spectator';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom, of } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
	let spectator: SpectatorService<AuthService>;

	const createService = createServiceFactory({
		service: AuthService,
		providers: [
			mockProvider(OAuthService, {
				// eslint-disable-next-line rxjs/finnish
				events: of({}),
			}),
		],
	});

	beforeEach(() => (spectator = createService()));

	it('should not be authenticated', () => {
		expect(firstValueFrom(spectator.service.isAuthenticated$)).resolves.toBe(
			false,
		);
	});

	it('should have isDoneLoading initially on false', () => {
		expect(firstValueFrom(spectator.service.isDoneLoading$)).resolves.toBe(
			false,
		);
	});

	it('should not have claims when unauthorized', () => {
		const mockOauth = spectator.inject(OAuthService);

		jest.spyOn(mockOauth, 'loadDiscoveryDocument').mockResolvedValue(null);
		jest.spyOn(mockOauth, 'hasValidAccessToken').mockResolvedValueOnce(false);

		spectator.service.init({}, '');

		expect(firstValueFrom(spectator.service.user$)).resolves.toEqual(null);
	});

	it('should set claims as user', () => {
		const mockOauth = spectator.inject(OAuthService);

		jest.spyOn(mockOauth, 'getIdentityClaims').mockReturnValue({
			given_name: 'firstname',
			family_name: 'lastname',
			emails: ['testmail', 'irrelevant testmail'],
		});

		jest.spyOn(mockOauth, 'loadDiscoveryDocument').mockResolvedValue(null);
		jest.spyOn(mockOauth, 'hasValidAccessToken').mockResolvedValueOnce(true); // isAuthenticated$ => true trigger

		spectator.service.init({}, ''); // start listening to events which sets the isAuthenticated flag with hasValidAccessToken()

		expect(firstValueFrom(spectator.service.user$)).resolves.toEqual({
			firstName: 'firstname',
			lastName: 'lastname',
			email: 'testmail',
		});
	});
});
