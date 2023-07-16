import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import * as SentryAngularIvy from '@sentry/angular-ivy';

import { AUTH_SERVICE, DevAuthService } from '@kordis/spa/auth';

import { SentryObservabilityService } from './sentry-observability.service';

const sentrySetUser = jest.spyOn(SentryAngularIvy, 'setUser');

describe('SentryObservabilityService', () => {
	let spectator: SpectatorService<SentryObservabilityService>;
	const createService = createServiceFactory({
		service: SentryObservabilityService,
		providers: [
			{
				provide: AUTH_SERVICE,
				useClass: DevAuthService,
			},
		],
	});

	beforeEach(() => (spectator = createService()));

	afterEach(() => {
		sentrySetUser.mockClear();
	});

	it('should set the user when provided with id, email, and username', () => {
		const id = '1';
		const email = 'test@example.com';
		const username = 'testuser';

		spectator.service.setUser(id, email, username);

		expect(sentrySetUser).toHaveBeenCalledTimes(2);
		expect(sentrySetUser).toHaveBeenCalledWith({
			id,
			email,
			username,
		});
	});

	it('should set the user to null when no id is provided', () => {
		spectator.service.setUser();

		expect(sentrySetUser).toHaveBeenCalledTimes(2);
		expect(sentrySetUser).toHaveBeenCalledWith(null);
	});

	it('should set observability user on auth user change', async () => {
		const authService = spectator.inject<DevAuthService>(AUTH_SERVICE);
		authService.setSession({
			id: '1',
			firstName: 'firstname',
			lastName: 'lastname',
			email: 'testmail',
		});
		expect(sentrySetUser).toHaveBeenCalledTimes(2);
		expect(sentrySetUser).toHaveBeenCalledWith({
			id: '1',
			email: 'testmail',
			username: 'firstname lastname',
		});
	});
});
