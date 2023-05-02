import * as SentryAngularIvy from '@sentry/angular-ivy';

import { SentryObservabilityService } from './sentry-observability.service';

const sentrySetUser = jest.spyOn(SentryAngularIvy, 'setUser');

describe('SentryObservabilityService', () => {
	let service: SentryObservabilityService;

	beforeEach(() => {
		service = new SentryObservabilityService();
	});

	afterEach(() => {
		sentrySetUser.mockClear();
	});

	it('should set the user when provided with id, email, and username', () => {
		const id = '1';
		const email = 'test@example.com';
		const username = 'testuser';

		service.setUser(id, email, username);

		expect(sentrySetUser).toHaveBeenCalledTimes(1);
		expect(sentrySetUser).toHaveBeenCalledWith({
			id,
			email,
			username,
		});
	});

	it('should set the user to null when no id is provided', () => {
		service.setUser();

		expect(sentrySetUser).toHaveBeenCalledTimes(1);
		expect(sentrySetUser).toHaveBeenCalledWith(null);
	});
});
