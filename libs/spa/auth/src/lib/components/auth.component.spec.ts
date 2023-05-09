import { createMock } from '@golevelup/ts-jest';
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator/jest';

import { AUTH_SERVICE, AuthService } from '../services/auth-service';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
	let spectator: SpectatorRouting<AuthComponent>;
	const createComponent = createRoutingFactory({
		component: AuthComponent,
		componentProviders: [
			{
				provide: AUTH_SERVICE,
				useValue: createMock<AuthService>(),
			},
		],
	});

	beforeEach(() => (spectator = createComponent()));

	it('should show error on query param error', () => {
		spectator.setRouteQueryParam('error', 'some error');

		expect(spectator.query('[data-testid="auth-error-msg"]')).toContainText(
			'Sie konnten nicht authentifiziert werden!',
		);
	});
});
