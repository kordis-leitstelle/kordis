import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator/jest';

import { AuthService } from '../services/auth.service';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
	let spectator: SpectatorRouting<AuthComponent>;
	const createComponent = createRoutingFactory({
		component: AuthComponent,
		componentMocks: [AuthService],
	});

	beforeEach(() => (spectator = createComponent()));

	it('should show error on query param error', () => {
		spectator.setRouteQueryParam('error', 'some error');

		expect(spectator.query('[data-testid="auth-error-msg"]')).toContainText(
			'Sie konnten nicht authentifiziert werden!',
		);
	});
});
