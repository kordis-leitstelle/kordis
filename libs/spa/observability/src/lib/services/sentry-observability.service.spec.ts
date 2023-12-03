import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { AUTH_SERVICE, DevAuthService } from '@kordis/spa/auth';

import { SentryObservabilityService } from './sentry-observability.service';

// https://github.com/getsentry/sentry-javascript/issues/9448
// @formatter:off
import * as SentryAngularIvy from '@sentry/angular-ivy';
jest.mock('@sentry/angular-ivy', () => ({ setUser: () => {} }));
const sentrySetUser = jest.spyOn(SentryAngularIvy, 'setUser');
// @formatter:on

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
